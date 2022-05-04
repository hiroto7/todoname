import axios from "axios";
import type { tasks_v1 } from "googleapis";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import React, { ReactNode, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  FloatingLabel,
  Form,
  Image,
  Nav,
  Navbar,
  OverlayTrigger,
  Placeholder,
  Row,
  Tooltip,
} from "react-bootstrap";
import useSWR from "swr";

const NameSamplePart: React.FC<{
  color: string;
  title: string;
  text: string;
}> = ({ color, title, text }) => (
  <OverlayTrigger
    overlay={
      <Tooltip id="tooltip1">
        <div>{title}</div>
        {text ? (
          <></>
        ) : (
          <div>
            <strong>なし</strong>
          </div>
        )}
      </Tooltip>
    }
  >
    {text ? (
      <span
        style={{
          outlineColor: `var(--bs-${color})`,
          outlineWidth: 1,
          outlineStyle: "solid",
        }}
      >
        {text}
      </span>
    ) : (
      <i
        className="bi bi-cursor-text"
        style={{
          color: `var(--bs-${color})`,
          marginLeft: "-0.5em",
          marginRight: "-0.5em",
        }}
      />
    )}
  </OverlayTrigger>
);

const dummyTasks = ["タスクその1", "タスクその2", "タスクその3"].map(
  (title, id) => ({ id, title })
);
const ProfileSummary: React.FC<{
  id: string;
  name: ReactNode;
  image: string;
}> = ({ id, name, image }) => (
  <>
    <Row className="gx-3">
      <Col xs="auto">
        <Image
          width={48}
          height={48}
          src={image}
          alt="avatar photo"
          roundedCircle
        />
      </Col>
      <Col>
        <div>{name}</div>
        <div>
          <small className="text-muted">{id}</small>
        </div>
      </Col>
    </Row>
  </>
);

const NameSample: React.FC<{
  tasks: readonly ({ id: number; title: string } | tasks_v1.Schema$Task)[];
  beginningText: string;
  separator: string;
  endText: string;
}> = ({ tasks, beginningText, separator, endText }) => (
  <>
    <NameSamplePart
      color="green"
      title="先頭の固定テキスト"
      text={beginningText}
    />
    {tasks
      .map((task) => <span key={task.id}>{task.title}</span>)
      .reduce((previousValue, currentValue) => (
        <>
          {previousValue}
          <NameSamplePart
            color="purple"
            title="タスク同士のセパレーター"
            text={separator}
          />
          {currentValue}
        </>
      ))}
    <NameSamplePart color="orange" title="末尾の固定テキスト" text={endText} />
  </>
);

const Sample: React.FC<{
  tasks: readonly tasks_v1.Schema$Task[] | undefined;
  beginningText: string;
  separator: string;
  endText: string;
  screenName: string;
  image: string;
}> = ({ tasks, beginningText, separator, endText, screenName, image }) => {
  const [showDummies, setShowDummies] = useState(false);
  const showDummies1 = showDummies || (tasks && tasks.length === 0);

  const tasks1 = showDummies1 ? dummyTasks : tasks;

  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <>
      <div className="mb-3">
        <Form.Check
          inline
          id="radio1"
          checked={!showDummies1}
          disabled={!tasks || tasks.length === 0}
          onChange={() => setShowDummies(false)}
          label="実際のタスクを表示"
          type="radio"
        />
        <Form.Check
          inline
          id="radio2"
          checked={showDummies1}
          onChange={() => setShowDummies(true)}
          label="ダミーのタスクを表示"
          type="radio"
        />
      </div>

      <ProfileSummary
        id={`@${screenName}`}
        name={
          tasks1 ? (
            <NameSample
              tasks={tasks1}
              beginningText={beginningText}
              separator={separator}
              endText={endText}
            />
          ) : (
            <Placeholder as="div" animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
          )
        }
        image={image}
      />
    </>
  );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const loggedInLabel = (
  <>
    <i className="bi bi-check-circle-fill" /> ログイン済み
  </>
);

const SignInButton: React.FC<{ provider: string; loading: boolean }> = ({
  provider,
  loading,
}) =>
  loading ? (
    <Placeholder.Button
      variant="secondary"
      className="w-100"
    ></Placeholder.Button>
  ) : (
    <Button
      variant="secondary"
      className="w-100"
      onClick={() => signIn(provider)}
    >
      <i className="bi bi-box-arrow-in-right" /> ログイン
    </Button>
  );

const Section: React.FC<{
  screenName: string;
  image: string;
}> = ({ screenName, image }) => {
  const {
    data: tasklists,
    error: tasklistsError,
    mutate: tasklistsMutate,
  } = useSWR<readonly tasks_v1.Schema$TaskList[]>("/api/tasklists", fetcher);

  const [tasklistId0, setTasklistId] = useState<string>();
  const tasklistId = tasklistId0 ?? tasklists?.[0]?.id;
  const tasklist = tasklists?.find((tasklist) => tasklist.id === tasklistId);

  const {
    data: tasks,
    error: taskError,
    mutate: taskMutate,
  } = useSWR<readonly tasks_v1.Schema$Task[]>(
    tasklistId && `/api/tasks?tasklist=${tasklistId}`,
    fetcher
  );

  const [normalName, setNormalName] = useState("");
  const [beginningText, setBeginningText] = useState("");
  const [separator, setSeparator] = useState("、");
  const [endText, setEndText] = useState("");

  return (
    <>
      <h2>To-Doリストを選択</h2>
      <p>
        選択したTo-Doリストの内容から名前が生成されます。選択したリストに機密情報が含まれないことを確認してください。
      </p>

      <Row className="justify-content-center">
        <Col sm={10} md={8} lg={6}>
          <Card body>
            <Row>
              {tasklist ? (
                <Col>
                  <Card.Title>
                    <i className="bi bi-list-task" /> {tasklist.title}
                  </Card.Title>
                  <Card.Text>
                    <small className="text-muted">
                      {new Date(tasklist.updated!).toLocaleString()}
                    </small>
                  </Card.Text>
                </Col>
              ) : (
                <Col xs={9} xl={10}>
                  <Placeholder as={Card.Title} animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                  <Placeholder as={Card.Text} animation="glow">
                    <Placeholder xs={4} size="sm" />
                  </Placeholder>
                </Col>
              )}
              {tasklists ? (
                <Col xs="auto">
                  <DropdownButton
                    id="tasklist-dropdown-button"
                    title="変更"
                    variant="secondary"
                  >
                    {tasklists.map((tasklist) => (
                      <Dropdown.Item
                        key={tasklist.id}
                        onClick={() => setTasklistId(tasklist.id!)}
                      >
                        <div>{tasklist.title}</div>
                        <div>
                          <small>
                            {new Date(tasklist.updated!).toLocaleString()}
                          </small>
                        </div>
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </Col>
              ) : (
                <Col xs={3} xl={2}>
                  <Placeholder.Button
                    variant="secondary"
                    xs={12}
                  ></Placeholder.Button>
                </Col>
              )}
            </Row>
            {tasks ? (
              tasks.length > 0 ? (
                <div>
                  {tasks
                    .map((task) => (
                      <Badge pill bg="dark" key={task.id}>
                        {task.title}
                      </Badge>
                    ))
                    .reduce((previousValue, currentValue) => (
                      <>
                        {previousValue} {currentValue}
                      </>
                    ))}
                </div>
              ) : (
                <Card.Text>
                  <i>未完了のタスクはありません</i>
                </Card.Text>
              )
            ) : (
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
            )}
          </Card>
        </Col>
      </Row>

      {downCaret}

      <h2>名前の生成方法を指定</h2>

      <Row xs={1} md={2} className="g-4 justify-content-center">
        <Col md={7}>
          <Card body>
            <Card.Title>タスクがあるとき</Card.Title>
            <Card.Text>
              To-Doリスト中の未完了のタスクに、これらの3つのテキストが組み合わさって名前が生成されます。
            </Card.Text>
            <Row className="gy-2 mb-3">
              <Col xl>
                <FloatingLabel
                  controlId="beginningText"
                  label="先頭の固定テキスト"
                >
                  <Form.Control
                    value={beginningText}
                    placeholder="先頭の固定テキスト"
                    style={{ borderColor: "var(--bs-green)" }}
                    onChange={(event) => setBeginningText(event.target.value)}
                  />
                </FloatingLabel>
              </Col>
              <Col xl>
                <FloatingLabel
                  controlId="separator"
                  label="タスク同士のセパレーター"
                >
                  <datalist id="separator-example">
                    <option value="、"></option>
                    <option value=" / "></option>
                  </datalist>
                  <Form.Control
                    list="separator-example"
                    placeholder="、"
                    value={separator}
                    style={{ borderColor: "var(--bs-purple)" }}
                    onChange={(event) => setSeparator(event.target.value)}
                  />
                </FloatingLabel>
              </Col>
              <Col xl>
                <FloatingLabel controlId="endText" label="末尾の固定テキスト">
                  <Form.Control
                    value={endText}
                    placeholder="末尾の固定テキスト"
                    style={{ borderColor: "var(--bs-orange)" }}
                    onChange={(event) => setEndText(event.target.value)}
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Card className="mt-3">
              <Card.Header>サンプル</Card.Header>
              <Card.Body>
                <Sample
                  tasks={tasks}
                  beginningText={beginningText}
                  separator={separator}
                  endText={endText}
                  screenName={screenName}
                  image={image}
                />
              </Card.Body>
            </Card>
          </Card>
        </Col>
        <Col md={5}>
          <Card body>
            <Card.Title>タスクがないとき</Card.Title>
            <Card.Text>
              To-Doリストに未完了タスクがひとつもないときは、ここに入力したテキストがそのまま名前になります。
            </Card.Text>
            <FloatingLabel
              controlId="normalName"
              label="タスクがないときの名前"
              className="mb-3"
            >
              <Form.Control
                value={normalName}
                placeholder="タスクがないときの名前"
                onChange={(event) => setNormalName(event.target.value)}
              />
            </FloatingLabel>
            <Card>
              <Card.Header>サンプル</Card.Header>
              <Card.Body>
                <ProfileSummary
                  id={`@${screenName}`}
                  name={normalName || <Placeholder xs={6} />}
                  image={image}
                />
              </Card.Body>
            </Card>
          </Card>
        </Col>
      </Row>

      {downCaret}

      <div className="d-grid mb-3">
        <Button
          size="lg"
          disabled={tasklistId === undefined || normalName.length === 0}
          onClick={() =>
            axios.post("/api/update", {
              tasklist: tasklistId,
              normalName,
              beginningText,
              separator,
              endText,
            })
          }
        >
          名前を書き換える
        </Button>
      </div>
    </>
  );
};

const downCaret = (
  <div className="text-center my-4">
    <i className="bi bi-caret-down-fill display-6" />
  </div>
);

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>To-Do Name</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            {session && (
              <Button variant="outline-secondary" onClick={() => signOut()}>
                <i className="bi bi-box-arrow-left" /> ログアウト
              </Button>
            )}
            <Nav>
              <Nav.Link
                href="https://github.com/hiroto7/todoname"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-github" /> GitHub
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-3">
        <Head>
          <title>To-Do Name</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <h1>To-Do Name</h1>

        <h2>アカウントにログイン</h2>
        <p>
          まず、TwitterアカウントとGoogleアカウントの<strong>両方に</strong>
          ログインします。
        </p>

        <Row xs={1} md={2} className="g-4 justify-content-center">
          <Col sm={10} lg={5} xl={4}>
            <Card body>
              <Card.Title>
                <i className="bi bi-twitter" /> Twitter
              </Card.Title>
              <Card.Text className="text-muted">
                ログインしたアカウントのプロフィールの名前が書き換えられます。
              </Card.Text>
              {session?.twitter ? (
                <>
                  <Card.Text className="text-success text-center">
                    {loggedInLabel}
                  </Card.Text>

                  <ProfileSummary
                    id={`@${session.twitter.screenName}`}
                    name={session.twitter.name}
                    image={session.twitter.image!}
                  />
                </>
              ) : (
                <SignInButton provider="twitter" loading={loading} />
              )}
            </Card>
          </Col>
          <Col sm={10} lg={5} xl={4}>
            <Card body>
              <Card.Title>
                <i className="bi bi-google" /> Google
              </Card.Title>
              <Card.Text className="text-muted">
                ログインしたアカウントのGoogle Tasksの内容が使用されます。
              </Card.Text>
              {session?.google ? (
                <>
                  <Card.Text className="text-success text-center">
                    {loggedInLabel}
                  </Card.Text>

                  <ProfileSummary
                    id={session.google.email!}
                    name={session.google.name}
                    image={session.google.image!}
                  />
                </>
              ) : (
                <SignInButton provider="google" loading={loading} />
              )}
            </Card>
          </Col>
        </Row>

        {session?.twitter && session.google ? (
          <>
            {downCaret}
            <Section
              screenName={session.twitter.screenName}
              image={session.twitter.image!}
            />
          </>
        ) : (
          <div className="text-muted">
            {downCaret}
            <p className="text-center">To-Doリストを選択</p>
            {downCaret}
            <p className="text-center">名前の生成方法を指定</p>
          </div>
        )}
      </Container>
    </>
  );
};

export default Home;
