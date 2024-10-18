import React, { useEffect } from "react";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import '@mantine/charts/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAuthStore from "../modules/auth/store";
import { Layout } from "../modules/layout";
import { useRouter } from 'next/router';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const setToken = useAuthStore((state) => state.setToken);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, [setToken]);

  const isAuthPage = router.pathname === '/auth';

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default MyApp;