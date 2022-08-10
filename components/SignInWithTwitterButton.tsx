import { Button } from "react-bootstrap";
import styles from "../styles/SignInWithTwitterButton.module.scss";

const SignInWithTwitterButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <Button className={styles["btn-twitter"]} onClick={onClick}>
    <i className="bi bi-twitter" /> Twitterでログイン
  </Button>
);

export default SignInWithTwitterButton;
