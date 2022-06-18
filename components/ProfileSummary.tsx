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

export const TwitterProfileSummary: React.FC<{
  user: Required<
    Pick<UserV2, "id" | "username" | "profile_image_url" | "protected">
  >;
  children: React.ReactNode;
}> = ({ user, children }) => (
  <ProfileSummary id={`@${user.username}`} image={user.profile_image_url}>
    <TwitterProfileName isProtected={user.protected}>
      {children}
    </TwitterProfileName>
  </ProfileSummary>
);

export const ProfileImage: React.FC<{ src: string }> = ({ src }) => (
  <Image width={48} height={48} src={src} alt="avatar photo" roundedCircle />
);

const ProfileSummary: React.FC<{
  id: string;
  children: React.ReactNode;
  image: string;
}> = ({ id, children, image }) => (
  <Row className="gx-3">
    <Col xs="auto">
      <ProfileImage src={image} />
    </Col>
    <Col>
      <div>{children}</div>
      <div>
        <small className="text-muted">{id}</small>
      </div>
    </Col>
  </Row>
);

export default ProfileSummary;
