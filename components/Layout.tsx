import React from "react";
import { Container } from "react-bootstrap";
import Header from "./Header";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Header />
    <Container as="main" className="my-4">
      {children}
    </Container>
  </>
);

export default Layout;
