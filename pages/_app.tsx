import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <SessionProvider session={pageProps.session} refetchInterval={0}>
    <Component {...pageProps} />
  </SessionProvider>
);

export default MyApp;
