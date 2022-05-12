import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button, Container, Nav, Navbar } from "react-bootstrap";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>To-Do Name</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {session && (
            <Button variant="outline-secondary" onClick={() => signOut()}>
              <i className="bi bi-box-arrow-left" /> ログアウト
            </Button>
          )}
          <Nav>
            <Nav.Link
              href="https://github.com/hiroto7/todoname"
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-github" /> GitHub
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
