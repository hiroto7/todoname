import styles from "../styles/SignInWithGoogleButton.module.css";

const SignInWithGoogleButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => <button className={styles["btn"]} onClick={onClick} />;

export default SignInWithGoogleButton;
