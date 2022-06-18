import { Card, Col, Form, Row } from "react-bootstrap";
import type { UserV2 } from "twitter-api-v2";
import { TwitterProfileSummary } from "./ProfileSummary";
import WithDatalist from "./WithDatalist";

type TwitterUser = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

const ProfileSampleCard0: React.FC<{
  name: string;
  user: TwitterUser;
}> = ({ name, user }) => (
  <Card>
    <Card.Header>サンプル</Card.Header>
    <Card.Body>
      <TwitterProfileSummary user={user}>
        {name || <i className="text-danger">名前を入力してください</i>}
      </TwitterProfileSummary>
    </Card.Body>
  </Card>
);

const RuleCard0: React.FC<{
  user: TwitterUser;
  normalName: string;
  onChange: (normalName: string) => void;
}> = ({ user, normalName, onChange }) => (
  <Card body>
    <Row className="gx-5 gy-3 align-items-center" xs={1} md={2}>
      <Col>
        <Card.Title>タスクがないとき</Card.Title>
        <Card.Text>
          未完了タスクがないとき、ここに入力したテキストがそのまま名前になります。
        </Card.Text>
        <WithDatalist options={[user.name]}>
          {(datalistId) => (
            <Form.Control
              value={normalName}
              list={datalistId}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        </WithDatalist>
      </Col>
      <Col>
        <ProfileSampleCard0 user={user} name={normalName} />
      </Col>
    </Row>
  </Card>
);

export default RuleCard0;
