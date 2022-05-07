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

const NameSampleComponent: React.FC<{
  color: string;
  title: string;
  text: string;
}> = ({ color, title, text }) => (
  <OverlayTrigger
    overlay={
      <Tooltip id="tooltip1">{text ? title : `${title}はありません`}</Tooltip>
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
        className="bi bi-cursor-text position-relative"
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

const beginningTextTitle = "先頭テキスト";
const separatorTitle = "セパレーター";
const endTextTitle = "末尾テキスト";

const beginningTextColor = "green";
const separatorColor = "purple";
const endTextColor = "orange";

const NameSample: React.FC<{
  tasks: readonly ({ id: number; title: string } | tasks_v1.Schema$Task)[];
  beginningText: string;
  separator: string;
  endText: string;
}> = ({ tasks, beginningText, separator, endText }) => (
  <>
    <NameSampleComponent
      color={beginningTextColor}
      title={beginningTextTitle}
      text={beginningText}
    />
    {tasks
      .map((task) => <span key={task.id}>{task.title}</span>)
      .reduce((previousValue, currentValue) => (
        <>
          {previousValue}
          <NameSampleComponent
            color={separatorColor}
            title={separatorTitle}
            text={separator}
          />
          {currentValue}
        </>
      ))}
    <NameSampleComponent
      color={endTextColor}
      title={endTextTitle}
      text={endText}
    />
  </>
);

const Sample0: React.FC<{
  screenName: string;
  normalName: string;
  image: string;
}> = ({ screenName, normalName, image }) => (
  <Card>
    <Card.Header>サンプル</Card.Header>
    <Card.Body>
      <ProfileSummary
        id={`@${screenName}`}
        name={normalName || <i>名前を入力してください</i>}
        image={image}
      />
    </Card.Body>
  </Card>
);

const Sample1: React.FC<{
  tasks: readonly tasks_v1.Schema$Task[] | undefined;
  beginningText: string;
  separator: string;
  endText: string;
  screenName: string;
  image: string;
}> = ({ tasks, beginningText, separator, endText, screenName, image }) => {
  const [showDummies, setShowDummies] = useState(false);
  const apparentlyShowDummies = showDummies || (tasks && tasks.length === 0);
  const apparentTasks = apparentlyShowDummies ? dummyTasks : tasks;

  return (
    <Card>
      <Card.Header>
        <Row className="justify-content-between">
          <Col xs="auto">サンプル</Col>
          <Col xs="auto">
            <Form.Check
              id="check1"
              type="checkbox"
              checked={apparentlyShowDummies}
              disabled={apparentlyShowDummies && (!tasks || tasks.length === 0)}
              onChange={() => setShowDummies(!showDummies)}
              label="ダミーで表示"
            />
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <ProfileSummary
          id={`@${screenName}`}
          name={
            apparentTasks ? (
              <NameSample
                tasks={apparentTasks}
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
      </Card.Body>
    </Card>
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

const NameComponentInput: React.FC<{
  color: string;
  text: string;
  name: string;
  title: string;
  examples?: readonly string[];
  onChange: (text: string) => void;
}> = ({ color, title, text, name, examples, onChange }) => {
  const datalistId = `${name}Datalist`;
  return (
    <Form.Group as={Row} xs={2}>
      <Form.Label column>{title}</Form.Label>
      <Col>
        {examples && (
          <datalist id={datalistId}>
            {examples.map((example) => (
              <option key={example} value={example} />
            ))}
          </datalist>
        )}
        <Form.Control
          value={text}
          list={datalistId}
          placeholder="なし"
          style={{ borderColor: `var(--bs-${color})` }}
          onChange={(event) => onChange(event.target.value)}
        />
      </Col>
    </Form.Group>
  );
};

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
    tasklistId && `/api/tasklists/${tasklistId}/tasks`,
    fetcher
  );

  const [normalName, setNormalName] = useState("");
  const [beginningText, setBeginningText] = useState("");
  const [separator, setSeparator] = useState("、");
  const [endText, setEndText] = useState("");

  return (
    <>
      <h2>To-Doリストを選択</h2>
      <p className="mb-0">選択したTo-Doリストの内容から名前が生成されます。</p>
      <p>
        <small className="text-warning">
          <i className="bi bi-exclamation-triangle-fill" />{" "}
          選択したリストに機密情報が含まれないことを確認してください。
        </small>
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
                      {new Date(tasklist.updated!).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
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
                            {new Date(tasklist.updated!).toLocaleString(
                              undefined,
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )}
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

      <Row xs={1} className="g-4 justify-content-center">
        <Col xs={12} lg={10} xl={9} className="d-grid gap-4">
          <Card body>
            <Row className="gx-5 gy-3 align-items-center" xs={1} md={2}>
              <Col>
                <Card.Title>タスクがあるとき</Card.Title>
                <Card.Text>
                  これら3つのテキストを、To-Doリスト中の未完了タスクに組み合わせて名前を生成します。
                </Card.Text>
                <fieldset className="d-grid gap-2">
                  <NameComponentInput
                    name="beginningText"
                    title={beginningTextTitle}
                    examples={[
                      `${normalName}@`,
                      `${normalName}/`,
                      `${normalName} `,
                    ]}
                    text={beginningText}
                    color={beginningTextColor}
                    onChange={setBeginningText}
                  />
                  <NameComponentInput
                    name="separator"
                    title={separatorTitle}
                    examples={[`、`, `/`]}
                    text={separator}
                    color={separatorColor}
                    onChange={setSeparator}
                  />
                  <NameComponentInput
                    name="endText"
                    title={endTextTitle}
                    text={endText}
                    color={endTextColor}
                    onChange={setEndText}
                  />
                </fieldset>
              </Col>
              <Col>
                <Sample1
                  tasks={tasks}
                  beginningText={beginningText}
                  separator={separator}
                  endText={endText}
                  screenName={screenName}
                  image={image}
                  key={2}
                />
              </Col>
            </Row>
          </Card>
          <Card body>
            <Row className="gx-5 gy-3 align-items-center" xs={1} md={2}>
              <Col>
                <Card.Title>タスクがないとき</Card.Title>
                <Card.Text>
                  未完了タスクがないとき、ここに入力したテキストがそのまま名前になります。
                </Card.Text>
                <Form.Control
                  value={normalName}
                  placeholder="なし"
                  onChange={(event) => setNormalName(event.target.value)}
                />
              </Col>
              <Col>
                <Sample0
                  normalName={normalName}
                  screenName={screenName}
                  image={image}
                />
              </Col>
            </Row>
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
