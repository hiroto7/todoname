import type { Rule } from "@prisma/client";
import { Card, Col, Form, Row } from "react-bootstrap";
import type { UserV2 } from "twitter-api-v2";
import useTasks from "../../hooks/useTasks";
import { BEGINNING_TEXT, END_TEXT, SEPARATOR } from "../../lib/constants";
import WithDatalist from "../WithDatalist";
import ProfileSampleCard from "./ProfileSampleCard";

type TwitterUser = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

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

const RuleCard1: React.FC<{
  user: TwitterUser;
  rule: { tasklist: string | undefined } & Pick<
    Rule,
    "normalName" | "beginningText" | "separator" | "endText"
  >;
  onBeginningTextChange: (beginningText: string) => void;
  onSeparatorChange: (separator: string) => void;
  onEndTextChange: (endText: string) => void;
}> = ({
  user,
  rule,
  onBeginningTextChange,
  onSeparatorChange,
  onEndTextChange,
}) => {
  const { normalName, beginningText, separator, endText, tasklist } = rule;
  const tasks = useTasks(tasklist);

  return (
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
              onChange={onBeginningTextChange}
              {...BEGINNING_TEXT}
            />
            <NameComponentInput
              examples={[`、`, `/`]}
              text={separator}
              onChange={onSeparatorChange}
              {...SEPARATOR}
            />
            <NameComponentInput
              examples={[]}
              text={endText}
              onChange={onEndTextChange}
              {...END_TEXT}
            />
          </fieldset>
        </Col>
        <Col>
          <ProfileSampleCard
            user={user}
            tasks={tasks}
            beginningText={beginningText}
            separator={separator}
            endText={endText}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default RuleCard1;
