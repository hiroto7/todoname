import type { tasks_v1 } from "googleapis";
import { useEffect } from "react";
import {
  Badge,
  Card,
  Col,
  Dropdown,
  DropdownButton,
  Placeholder,
  Row,
} from "react-bootstrap";
import useSWR from "swr";
import useTasks from "../hooks/useTasks";
import fetcher from "../lib/fetcher";
import onErrorRetry from "../lib/onErrorRetry";

const TasklistPicker: React.FC<{
  tasklist: string | undefined;
  onChange: (tasklist: string) => void;
}> = ({ tasklist: tasklistId, onChange }) => {
  const { data: tasklists } = useSWR<readonly tasks_v1.Schema$TaskList[]>(
    "/api/tasklists",
    fetcher,
    { onErrorRetry }
  );

  const defaultTasklist = tasklists?.[0];
  const tasklist = tasklists?.find((tasklist) => tasklist.id === tasklistId);

  useEffect(() => {
    if (!tasklist && defaultTasklist) onChange(defaultTasklist.id!);
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
              <small>
                <Placeholder xs={4} />
              </small>
            </Placeholder>
          </Col>
        )}
        {tasklists ? (
          <Col xs="auto">
            <DropdownButton title="変更" variant="secondary">
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

export default TasklistPicker;
