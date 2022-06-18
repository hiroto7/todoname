import { Button } from "react-bootstrap";
import styles from "../styles/SignInWithTwitterButton.module.scss";

const SignInWithTwitterButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled }) => (
  <Button
    className={styles["btn-twitter"]}
    onClick={onClick}
    disabled={disabled}
  >
    <i className="bi bi-twitter" /> Twitterでログイン
  </Button>
);

export default SignInWithTwitterButton;
