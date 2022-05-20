import { Col, Image, Row } from "react-bootstrap";
import type { UserV2 } from "twitter-api-v2";

export const TwitterProfileName: React.FC<{
  children: React.ReactNode;
  isProtected: boolean;
}> = ({ children, isProtected }) =>
  isProtected ? (
    <>
      {children} <i className="bi bi-lock-fill" />
    </>
  ) : (
    <>{children}</>
  );

type TwitterUser = Required<
  Pick<UserV2, "id" | "name" | "username" | "profile_image_url" | "protected">
>;

export const TwitterProfileSummary: React.FC<{
  user: Omit<TwitterUser, "name">;
  name: React.ReactNode;
}> = ({ user, name }) => (
  <ProfileSummary
    name={
      <TwitterProfileName isProtected={user.protected}>
        {name}
      </TwitterProfileName>
    }
    id={`@${user.username}`}
    image={user.profile_image_url}
  />
);

export const ProfileImage: React.FC<{ src: string }> = ({ src }) => (
  <Image width={48} height={48} src={src} alt="avatar photo" roundedCircle />
);

const ProfileSummary: React.FC<{
  id: string;
  name: React.ReactNode;
  image: string;
}> = ({ id, name, image }) => (
  <Row className="gx-3">
    <Col xs="auto">
      <ProfileImage src={image} />
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
