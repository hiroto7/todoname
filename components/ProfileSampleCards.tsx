import type { tasks_v1 } from "googleapis";
import { useState } from "react";
import {
  Card,
  Col,
  Form,
  OverlayTrigger,
  Placeholder,
  Row,
  Tooltip,
} from "react-bootstrap";
import type { UserV2 } from "twitter-api-v2";
import { BEGINNING_TEXT, END_TEXT, SEPARATOR } from "../lib/constants";
import ProfileSummary, {
  TwitterProfileName,
  TwitterProfileSummary,
} from "./ProfileSummary";

type TwitterUser = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

export const ProfileSampleCard0: React.FC<{
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

const NameSampleComponent: React.FC<{
  color: string;
  title: string;
  children: string;
}> = ({ color, title, children }) => (
  <OverlayTrigger
    overlay={
      <Tooltip id="tooltip1">
        {children ? title : `${title}はありません`}
      </Tooltip>
    }
  >
    {children ? (
      <span
        style={{
          outlineColor: `var(--bs-${color})`,
          outlineWidth: 1,
          outlineStyle: "solid",
        }}
      >
        {children}
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

const NameSample: React.FC<{
  tasks: readonly (typeof DUMMY_TASKS[number] | tasks_v1.Schema$Task)[];
  beginningText: string;
  separator: string;
  endText: string;
}> = ({ tasks, beginningText, separator, endText }) => (
  <>
    <NameSampleComponent {...BEGINNING_TEXT}>
      {beginningText}
    </NameSampleComponent>
    {tasks
      .map((task) => <span key={task.id}>{task.title}</span>)
      .reduce((previousValue, currentValue) => (
        <>
          {previousValue}
          <NameSampleComponent {...SEPARATOR}>{separator}</NameSampleComponent>
          {currentValue}
        </>
      ))}
    <NameSampleComponent {...END_TEXT}>{endText}</NameSampleComponent>
  </>
);

const DUMMY_TASKS = ["タスクその1", "タスクその2", "タスクその3"].map(
  (title, id) => ({ id, title } as const)
);

export const ProfileSampleCard1: React.FC<{
  tasks: readonly tasks_v1.Schema$Task[] | undefined;
  beginningText: string;
  separator: string;
  endText: string;
  user: TwitterUser;
}> = ({ tasks, beginningText, separator, endText, user }) => {
  const [showDummies, setShowDummies] = useState(false);
  const apparentlyShowDummies = (tasks && tasks.length === 0) || showDummies;
  const apparentTasks = apparentlyShowDummies ? DUMMY_TASKS : tasks;

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
