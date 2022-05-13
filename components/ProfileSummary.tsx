import { Col, Image, Row } from "react-bootstrap";
import type { UserV2 } from "twitter-api-v2";

export const TwitterProfileName: React.FC<{
  name: React.ReactNode;
  isProtected: boolean;
}> = ({ name, isProtected }) =>
  isProtected ? (
    <>
      {name} <i className="bi bi-lock-fill" />
    </>
  ) : (
    <>{name}</>
  );

type TwitterUser = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

export const TwitterProfileSummary: React.FC<{
  user: Omit<TwitterUser, "name">;
  name: React.ReactNode;
}> = ({ user, name }) => (
  <ProfileSummary
    name={<TwitterProfileName name={name} isProtected={user.protected} />}
    id={`@${user.username}`}
    image={user.profile_image_url}
  />
);

const ProfileSummary: React.FC<{
  id: string;
  name: React.ReactNode;
  image: string;
}> = ({ id, name, image }) => (
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
);

export default ProfileSummary;
