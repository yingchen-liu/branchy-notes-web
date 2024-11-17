import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import "./i18n"; // Make sure i18n is imported to initialize it
import i18n from "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-6baxwkch7bqq44hi.us.auth0.com"
      clientId="DMm6cb1MxuEjSJdvTUjLqUoCSDUZel4s"
      authorizationParams={{
        redirect_uri: `${window.location.origin}/login`,
        audience: "https://yingchenliu.com/my-website/services",
        ui_locales: i18n.language
      }}
      cacheLocation="localstorage"
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>
);
