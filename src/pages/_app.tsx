import "../styles/globals.css";

import { withTRPC } from "@trpc/next";
import type { AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import superjson from "superjson";

import VolumeContextProvider from "@/context/VolumeContext";

import type { AppRouter } from "../server/router";

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
      </Head>
      <Toaster />
      <NextNProgress color="#FE2C55" options={{ showSpinner: false }} />
      <SessionProvider session={session}>
        <VolumeContextProvider>
          <Component {...pageProps} />
        </VolumeContextProvider>
      </SessionProvider>
    </>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.browser) return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config() {
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
    };
  },
  ssr: false,
})(MyApp);
