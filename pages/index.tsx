import assert from "assert";
import axios from "axios";
import type { oauth2_v2 } from "googleapis";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Placeholder,
  Row,
} from "react-bootstrap";
import useSWR from "swr";
import type { UserV2 } from "twitter-api-v2";
import Layout from "../components/Layout";
import {
  ProfileSampleCard0,
  ProfileSampleCard1,
} from "../components/ProfileSampleCards";
import ProfileSummary, {
  TwitterProfileSummary,
} from "../components/ProfileSummary";
import TasklistPicker from "../components/TasklistPicker";
import WithDatalist from "../components/WithDatalist";
import useTasks from "../hooks/useTasks";
import { BEGINNING_TEXT, END_TEXT, SEPARATOR } from "../lib/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const loggedInLabel = (
  <>
    <i className="bi bi-check-circle-fill" /> ログイン済み
  </>
);

const SignInButton: React.FC<{ provider: string; loading: boolean }> = ({
  provider,
  loading,
}) => {
  const router = useRouter();

  return loading ? (
    <Placeholder.Button
      variant="secondary"
      className="w-100"
    ></Placeholder.Button>
  ) : (
    <Button
      variant="secondary"
      className="w-100"
      onClick={() => signIn(provider, { callbackUrl: router.pathname })}
    >
      <i className="bi bi-box-arrow-in-right" /> ログイン
    </Button>
  );
};

const NameComponentInput: React.FC<{
  color: string;
  text: string;
  name: string;
  title: string;
  examples: readonly string[];
  onChange: (text: string) => void;
}> = ({ color, title, text, name, examples, onChange }) => (
  <Form.Group as={Row} xs={2}>
    <Form.Label column>{title}</Form.Label>
    <Col>
      <WithDatalist datalistId={`${name}Datalist`} options={examples}>
        {(datalistId) => (
          <Form.Control
            value={text}
            list={datalistId}
            placeholder="なし"
            style={{ borderColor: `var(--bs-${color})` }}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
      </WithDatalist>
    </Col>
  </Form.Group>
);

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
                    examples={(normalName.length > 0 && normalName !== user.name
                      ? [normalName, user.name]
                      : [user.name]
                    ).flatMap((name) => [`${name}@`, `${name}/`, `${name} `])}
                    text={beginningText}
                    onChange={setBeginningText}
                    {...BEGINNING_TEXT}
                  />
                  <NameComponentInput
                    examples={[`、`, `/`]}
                    text={separator}
                    onChange={setSeparator}
                    {...SEPARATOR}
                  />
                  <NameComponentInput
                    examples={[]}
                    text={endText}
                    onChange={setEndText}
                    {...END_TEXT}
                  />
                </fieldset>
              </Col>
              <Col>
                <ProfileSampleCard1
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
                <WithDatalist
                  datalistId="normalNameDatalist"
                  options={[user.name]}
                >
                  {(datalistId) => (
                    <Form.Control
                      value={normalName}
                      list={datalistId}
                      onChange={(event) => setNormalName(event.target.value)}
                    />
                  )}
                </WithDatalist>
              </Col>
              <Col>
                <ProfileSampleCard0 user={user} name={normalName} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {downCaret}

      <Button
        size="lg"
        className="w-100"
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

const SignInErrorAlert: React.FC<{ error: string }> = ({ error }) => (
  <Alert variant="danger">
    {error === "OAuthAccountNotLinked" ? (
      <>
        <p>
          アカウントのリンクに失敗しました。以前ログインしたことのあるアカウントを、現在ログイン済みのアカウントにリンクすることはできません。
        </p>
        <p>
          一方のアカウントで「リンクを解除」または「データを削除」を行うことで、リンクできるようになります。
        </p>
      </>
    ) : (
      <p>ログインに失敗しました。</p>
    )}

    <p className="mb-0">
      <small>{error}</small>
    </p>
  </Alert>
);

const Home: NextPage = () => {
  const router = useRouter();
  const { error } = router.query;

  assert(!(error instanceof Array));

  const {
    data: twitter,
    error: twitterError,
    mutate,
  } = useSWR<TwitterUser>("/api/twitter", fetcher);

  const { data: google, error: googleError } =
    useSWR<oauth2_v2.Schema$Userinfo>("/api/google", fetcher);

  return (
    <Layout>
      <Head>
        <title>To-Do Name</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
      {error && <SignInErrorAlert error={error} />}

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
    </Layout>
  );
};

export default Home;
