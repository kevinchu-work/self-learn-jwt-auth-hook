import axios from "axios";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

// - Constant -----------------------------------
export const API_URL = {
  LOGIN: "/api/identity/token",
  REFRESH_TOKEN: "/api/identity/token/refresh"
  // force_refresh: "/v1/authentication/tokens/refresh/force",
};

// - Initial ------------------------------------
const api = axios.create({
  baseURL: "https://microservice-identitymanagement.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true
});


// - Helper fn ----------------------------------
const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await api.get(API_URL.REFRESH_TOKEN);

    setAuth((prev) => {
      if (process.env.NODE_ENV === "development") {
        console.log(JSON.stringify(prev), response.data);
      }

      return { ...prev, ...response.data };
    });

    return response.data.accessToken;
  };

  return refresh;
};

// - Hook ---------------------------------------
const useAPI = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"] && auth?.accessToken) {
          config.headers["x-access-token"] = auth?.accessToken;
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    ); // Request Intercept

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          return api(prevRequest);
        }
        // else
        return Promise.reject(error);
      }
    ); // Response Intercept

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return api;
};
export default useAPI;
