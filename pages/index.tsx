import type { Rule } from "@prisma/client";
import assert from "assert";
import axios, { AxiosError } from "axios";
import type { oauth2_v2 } from "googleapis";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Dropdown,
  OverlayTrigger,
  Placeholder,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import useSWR from "swr";
import type { UserV2 } from "twitter-api-v2";
import Layout from "../components/Layout";
import { ProfileImage, TwitterProfileName } from "../components/ProfileSummary";
import RuleCard0 from "../components/RuleCard0";
import RuleCard1 from "../components/RuleCard1";
import TasklistPicker from "../components/TasklistPicker";
import fetcher from "../lib/fetcher";
import onErrorRetry from "../lib/onErrorRetry";

const SignInButton: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      className="w-100"
      onClick={() => signIn(id, { callbackUrl: router.pathname })}
    >
      <i className="bi bi-box-arrow-in-right" /> {name}でログイン
    </Button>
  );
};

const SignedInAccountOptionsButton: React.FC<{ id: string; name: string }> = ({
  id,
  name,
}) => {
  const router = useRouter();

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-success" size="sm" className="w-100">
        <i className="bi bi-check-circle-fill" /> ログイン済み
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() =>
            signIn(id, {
              callbackUrl: router.pathname,
            })
          }
        >
          別の{name}アカウントにログイン
        </Dropdown.Item>
        <Dropdown.Item disabled>リンクを解除</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const downCaret = (
  <div className="text-center mt-5">
    <i className="bi bi-chevron-double-down display-6" />
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

const ApplyButton: React.FC<{
  rule: Pick<Rule, "beginningText" | "separator" | "endText" | "normalName"> & {
    tasklist: string | undefined;
  };
}> = ({ rule }) => {
  const [status, setStatus] = useState<"sending" | "success" | "error">();

  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [status]);

  return (
    <>
      <Button
        size="lg"
        className="w-100"
        disabled={
          status === "sending" ||
          rule.tasklist === undefined ||
          rule.normalName.length === 0
        }
        onClick={
          rule.tasklist === undefined || rule.normalName.length === 0
            ? undefined
            : async () => {
                try {
                  setStatus("sending");
                  await axios.put("/api/rule", rule);
                  setStatus("success");
                } catch (e) {
                  setStatus("error");
                }
              }
        }
      >
        {status === "sending" ? (
          <Spinner animation="border" size="sm" />
        ) : (
          "ルールを適用"
        )}
      </Button>
      {status === "success" ? (
        <p className="text-success text-center mt-2" ref={ref}>
          <i className="bi bi-check-circle-fill" />{" "}
          <strong>ルールを適用し、名前を更新しました</strong>
        </p>
      ) : status === "error" ? (
        <p className="text-danger text-center mt-2" ref={ref}>
          <i className="bi bi-x-octagon-fill" />{" "}
          <strong>ルールを適用できませんでした</strong>
        </p>
      ) : (
        <></>
      )}
    </>
  );
};

const Home: NextPage = () => {
  const router = useRouter();
  const { error } = router.query;

  assert(!(error instanceof Array));

  const {
    data: twitter,
    error: twitterError,
    mutate,
  } = useSWR<TwitterUser>("/api/twitter", fetcher, { onErrorRetry });

  const { data: google, error: googleError } =
    useSWR<oauth2_v2.Schema$Userinfo>("/api/google", fetcher, { onErrorRetry });

  const { data: storedRule, error: ruleError } = useSWR<Rule>(
    "/api/rule",
    fetcher,
    {
      onErrorRetry,
    }
  );

  const [rule, setRule] = useState<
    Pick<Rule, "beginningText" | "separator" | "endText" | "normalName"> & {
      tasklist: string | undefined;
    }
  >();

  useEffect(() => {
    if (
      !rule &&
      twitter &&
      (storedRule ||
        (ruleError instanceof AxiosError && ruleError.response?.status === 404))
    ) {
      setRule(
        storedRule ?? {
          beginningText: `${twitter.name}@`,
          separator: "、",
          endText: "",
          normalName: twitter.name,
          tasklist: undefined,
        }
      );
    }
  }, [rule, ruleError, storedRule, twitter]);

  return (
    <Layout>
      <Head>
        <title>todoname</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>todoname</h1>
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
          このサイトにToDoリストを編集する機能はありません。
        </small>
      </p>

      <section className="mt-5">
        <h2>アカウントにログイン</h2>
        <p>
          まず、TwitterアカウントとGoogleアカウントの<strong>両方に</strong>
          ログインします。
        </p>
        {error && <SignInErrorAlert error={error} />}

        <Row className="justify-content-center">
          <Col className="d-grid gap-4" lg={10} xl={9}>
            <Card body>
              <Row className="gy-3 align-items-center">
                <Col>
                  <Card.Title>Twitterアカウント</Card.Title>
                  <Card.Text className="text-muted">
                    ログインしたアカウントのプロフィールの名前が書き換えられます。
                  </Card.Text>
                </Col>
                {twitterError instanceof AxiosError &&
                twitterError.response?.status === 401 ? (
                  <Col sm="auto">
                    <SignInButton id="twitter" name="Twitter" />
                  </Col>
                ) : twitter ? (
                  <Col sm="auto">
                    <Row className="align-items-center gx-3">
                      <Col>
                        <SignedInAccountOptionsButton
                          id="twitter"
                          name="Twitter"
                        />
                      </Col>

                      <Col xs="auto">
                        <OverlayTrigger
                          overlay={(props) => (
                            // @ts-expect-error
                            <Tooltip {...props}>
                              <TwitterProfileName
                                isProtected={twitter.protected}
                              >
                                {twitter.name}
                              </TwitterProfileName>{" "}
                              <small>@{twitter.username}</small>
                            </Tooltip>
                          )}
                        >
                          <div>
                            <ProfileImage src={twitter.profile_image_url} />
                          </div>
                        </OverlayTrigger>
                      </Col>
                    </Row>
                  </Col>
                ) : (
                  <Col sm={3}>
                    <Placeholder.Button variant="secondary" xs={12} />
                  </Col>
                )}
              </Row>
            </Card>

            <Card body>
              <Row className="gy-3 align-items-center">
                <Col>
                  <Card.Title>Googleアカウント</Card.Title>
                  <Card.Text className="text-muted">
                    ログインしたアカウントのGoogle Tasksの内容が使用されます。
                  </Card.Text>
                </Col>
                {googleError instanceof AxiosError &&
                (googleError.response?.status === 401 ||
                  googleError.response?.status === 403) ? (
                  <Col sm="auto">
                    <SignInButton id="google" name="Google" />
                  </Col>
                ) : google ? (
                  <Col sm="auto">
                    <Row className="align-items-center gx-3">
                      <Col>
                        <SignedInAccountOptionsButton
                          id="google"
                          name="Google"
                        />
                      </Col>

                      <Col xs="auto">
                        <ProfileImage src={google.picture!} />
                      </Col>
                    </Row>
                  </Col>
                ) : (
                  <Col sm={3}>
                    <Placeholder.Button variant="secondary" xs={12} />
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        </Row>
      </section>

      {downCaret}

      {rule &&
      twitter &&
      !(
        twitterError instanceof AxiosError &&
        twitterError.response?.status === 401
      ) &&
      google &&
      !(
        googleError instanceof AxiosError &&
        (googleError.response?.status === 401 ||
          googleError.response?.status === 403)
      ) ? (
        <>
          <section className="mt-5">
            <h2>ToDoリストを選択</h2>
            <p>ここで選択したToDoリストの内容から名前が生成されます。</p>
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
                <TasklistPicker
                  tasklist={rule.tasklist}
                  onChange={(tasklist) => setRule({ ...rule, tasklist })}
                />
              </Col>
            </Row>
          </section>
          {downCaret}

          <section className="mt-5">
            <h2>名前の生成ルールを指定</h2>

            <Row className="g-4 justify-content-center">
              <Col lg={10} xl={9} className="d-grid gap-4">
                <RuleCard1
                  user={twitter}
                  rule={rule}
                  onBeginningTextChange={(beginningText) =>
                    setRule({ ...rule, beginningText })
                  }
                  onSeparatorChange={(separator) =>
                    setRule({ ...rule, separator })
                  }
                  onEndTextChange={(endText) => setRule({ ...rule, endText })}
                />
                <RuleCard0
                  user={twitter}
                  normalName={rule.normalName}
                  onChange={(normalName) => setRule({ ...rule, normalName })}
                />
              </Col>
            </Row>
          </section>

          {downCaret}

          <section className="mt-5">
            <div className="mb-3">
              <ApplyButton rule={rule} />
            </div>
            <p>
              このボタンを押すと、指定したルールで直ちに名前が更新されます。
            </p>
            <p>
              また、15分ごとにこのルールで名前が更新されるようになります。
              ただし、名前が手動で変更された場合は、自動更新が停止されます。
            </p>
            <p>
              <small className="text-muted">
                予告なく自動更新を停止したり、更新頻度を変更する場合があります。
              </small>
            </p>
          </section>
        </>
      ) : (
        <p className="text-muted text-center mt-5">
          両方のアカウントにログインしたら、名前の生成ルールを指定します
        </p>
      )}
    </Layout>
  );
};

export default Home;
