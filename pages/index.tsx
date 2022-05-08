import axios from "axios";
import type { oauth2_v2, tasks_v1 } from "googleapis";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import React, { useEffect, useState, type ReactNode } from "react";
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
import type { UserV2 } from "twitter-api-v2";

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

const TwitterProfileName: React.FC<{
  name: ReactNode;
  isProtected: boolean;
}> = ({ name, isProtected }) =>
  isProtected ? (
    <>
      {name} <i className="bi bi-lock-fill" />
    </>
  ) : (
    <>{name}</>
  );

const TwitterProfileSummary: React.FC<{
  user: Omit<TwitterUser, "name">;
  name: ReactNode;
}> = ({ user, name }) => (
  <ProfileSummary
    name={<TwitterProfileName name={name} isProtected={user.protected} />}
    id={`@${user.username}`}
    image={user.profile_image_url}
  />
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
  name: string;
  user: TwitterUser;
}> = ({ name, user }) => (
  <Card>
    <Card.Header>サンプル</Card.Header>
    <Card.Body>
      <TwitterProfileSummary
        user={user}
        name={name || <i className="text-danger">名前を入力してください</i>}
      />
    </Card.Body>
  </Card>
);

const Sample1: React.FC<{
  tasks: readonly tasks_v1.Schema$Task[] | undefined;
  beginningText: string;
  separator: string;
  endText: string;
  user: TwitterUser;
}> = ({ tasks, beginningText, separator, endText, user }) => {
  const [showDummies, setShowDummies] = useState(false);
  const apparentlyShowDummies = (tasks && tasks.length === 0) || showDummies;
  const apparentTasks = apparentlyShowDummies ? dummyTasks : tasks;

  return (
    <Card>
      <Card.Header>
        <Row className="justify-content-between">
          <Col xs="auto">サンプル</Col>
          <Col xs="auto">
            <Form.Check
              id="showDummiesCheck"
              type="switch"
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
          name={
            apparentTasks ? (
              <TwitterProfileName
                name={
                  <NameSample
                    tasks={apparentTasks}
                    beginningText={beginningText}
                    separator={separator}
                    endText={endText}
                  />
                }
                isProtected={user.protected}
              />
            ) : (
              <Placeholder as="div" animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
            )
          }
          id={`@${user.username}`}
          image={user.profile_image_url}
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

const useTasks = (tasklist: string | null | undefined) => {
  const { data } = useSWR<readonly tasks_v1.Schema$Task[]>(
    tasklist && `/api/tasklists/${tasklist}/tasks`,
    fetcher
  );
  return data;
};

const TasklistPicker: React.FC<{
  tasklist: string | undefined;
  onChange: (tasklist: string) => void;
}> = ({ tasklist: tasklistId, onChange }) => {
  const { data: tasklists } = useSWR<readonly tasks_v1.Schema$TaskList[]>(
    "/api/tasklists",
    fetcher
  );

  const defaultTasklist = tasklists?.[0];
  const tasklist = tasklists?.find((tasklist) => tasklist.id === tasklistId);

  useEffect(() => {
    if (!tasklist && defaultTasklist) {
      onChange(defaultTasklist.id!);
    }
  }, [defaultTasklist, onChange, tasklist]);

  const tasks = useTasks(tasklist?.id);

  return (
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
                  onClick={() => onChange(tasklist.id!)}
                  active={tasklist.id === tasklistId}
                >
                  <div>{tasklist.title}</div>
                  <div>
                    <small>
                      {new Date(tasklist.updated!).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
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
          <Placeholder xs={2} /> <Placeholder xs={3} /> <Placeholder xs={2} />
        </Placeholder>
      )}
    </Card>
  );
};

const Section: React.FC<{ user: TwitterUser }> = ({ user }) => {
  const [tasklist, setTasklist] = useState<string>();
  const [normalName, setNormalName] = useState(user.name);
  const [beginningText, setBeginningText] = useState(`${user.name}@`);
  const [separator, setSeparator] = useState("、");
  const [endText, setEndText] = useState("");

  const tasks = useTasks(tasklist);

  return (
    <>
      <h2>To-Doリストを選択</h2>
      <p className="mb-0">
        ここで選択したTo-Doリストの内容から名前が生成されます。
      </p>
      <p>
        <small className="text-warning">
          <i className="bi bi-exclamation-triangle-fill" />{" "}
          選択したリストの内容は誰でも見られる状態になるため、機密情報が含まれないことを確認してください。公開できるリストがない場合は、先に
          <a
            href="https://support.google.com/tasks/answer/7675771"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Tasksで新たなリストを作成
          </a>
          してください。
        </small>
      </p>

      <Row className="justify-content-center">
        <Col sm={10} md={8} lg={6}>
          <TasklistPicker tasklist={tasklist} onChange={setTasklist} />
        </Col>
      </Row>

      {downCaret}

      <h2>名前の生成ルールを指定</h2>

      <Row xs={1} className="g-4 justify-content-center">
        <Col xs={12} lg={10} xl={9} className="d-grid gap-4">
          <Card body>
            <Row className="gx-5 gy-3 align-items-center" xs={1} md={2}>
              <Col>
                <Card.Title>タスクがあるとき</Card.Title>
                <Card.Text>
                  3種類のテキストを、To-Doリスト内の未完了タスクに組み合わせて名前を生成します。
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
                  user={user}
                  tasks={tasks}
                  beginningText={beginningText}
                  separator={separator}
                  endText={endText}
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
                <Sample0 user={user} name={normalName} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {downCaret}

      <Button
        size="lg"
        className="w-100 mb-3"
        {...(tasklist === undefined || normalName.length === 0
          ? { disabled: true }
          : {
              onClick: () =>
                axios.post("/api/update", {
                  tasklist,
                  normalName,
                  beginningText,
                  separator,
                  endText,
                }),
            })}
      >
        名前を書き換える
      </Button>
    </>
  );
};

const downCaret = (
  <div className="text-center my-4">
    <i className="bi bi-caret-down-fill display-6" />
  </div>
);

type TwitterUser = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

const Home: NextPage = () => {
  const { data: session } = useSession();

  const {
    data: twitter,
    error: twitterError,
    mutate,
  } = useSWR<TwitterUser>("/api/twitter", fetcher);

  const { data: google, error: googleError } =
    useSWR<oauth2_v2.Schema$Userinfo>("/api/google", fetcher);

  return (
    <>
      <Head>
        <title>To-Do Name</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
        <h1>To-Do Name</h1>
        <p className="lead">やることをTwitterの名前に常に表示しよう</p>
        <p>
          <a
            href="https://support.google.com/tasks/answer/7675772"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Tasks
          </a>
          から未完了タスクを自動的に取得し、指定したルールでTwitterの名前へ反映されるようにできます。Twitterを開いている間なら、やることを忘れる心配がありません。
        </p>
        <p>
          <small className="text-muted">
            このサイトにTo-Doリストを編集する機能はありません。
          </small>
        </p>

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
              {twitter && twitterError === undefined ? (
                <>
                  <Card.Text className="text-success text-center">
                    {loggedInLabel}
                  </Card.Text>

                  <TwitterProfileSummary user={twitter} name={twitter.name} />
                </>
              ) : (
                <SignInButton
                  provider="twitter"
                  loading={!twitter && twitterError === undefined}
                />
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
              {google && googleError === undefined ? (
                <>
                  <Card.Text className="text-success text-center">
                    {loggedInLabel}
                  </Card.Text>

                  <ProfileSummary
                    id={google.email!}
                    name={google.name}
                    image={google.picture!}
                  />
                </>
              ) : (
                <SignInButton
                  provider="google"
                  loading={!google && googleError === undefined}
                />
              )}
            </Card>
          </Col>
        </Row>

        {twitter &&
        twitterError === undefined &&
        google &&
        googleError === undefined ? (
          <>
            {downCaret}
            <Section user={twitter} />
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
