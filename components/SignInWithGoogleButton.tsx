import styles from "../styles/SignInWithGoogleButton.module.css";

const SignInWithGoogleButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled }) => (
  <button className={styles["btn"]} onClick={onClick} disabled={disabled} />
);

export default SignInWithGoogleButton;
