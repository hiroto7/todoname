import type { Rule } from "@prisma/client";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Container, Nav, Navbar } from "react-bootstrap";
import useSWR from "swr";
import fetcher from "../lib/fetcher";
import onErrorRetry from "../lib/onErrorRetry";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: rule, mutate } = useSWR<Rule>("/api/rule", fetcher, {
    onErrorRetry,
  });

  return (
    <Navbar bg="dark" variant="dark" expand="sm">
      <Container>
        <Navbar.Brand>todoname</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            {typeof rule?.generatedName === "string" ? (
              <Nav.Link
                onClick={async () => {
                  await axios.post("/api/rule/disable");
                  mutate();
                }}
              >
                <i className="bi bi-slash-circle" /> 名前の自動更新を停止
              </Nav.Link>
            ) : (
              <></>
            )}
            {session && (
              <Nav.Link
                onClick={() => signOut({ callbackUrl: router.pathname })}
              >
                <i className="bi bi-box-arrow-left" /> ログアウト
              </Nav.Link>
            )}
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
