import axios from 'axios';

// Constant
export const API_URL = {
  SERVER_HOST: "https://microservice-identitymanagement.azurewebsites.net",
  LOGIN: "/api/identity/token",
  REFRESH_TOKEN: "/api/identity/token/refresh",
  // force_refresh: "/v1/authentication/tokens/refresh/force",
};

let jwtToken = { token: '', refreshToken: '', expires: 0 };

const api = axios.create({
  baseURL: API_URL.SERVER_HOST,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true
});


api.interceptors.request.use(
  (config) => {

    // console.log("instance.interceptors.request.use");

    if (jwtToken.token) {
      config.headers["x-access-token"] = jwtToken.token;
      config.headers["Authorization"] = `Bearer ${jwtToken.token}`
    }
    return config;
  },
  (error) => {
    console.log("instance.interceptors.request.use.err", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    // console.log("instance.interceptors.response.use");
    return res;
  },
  async (err) => {

    // console.log("instance.interceptors.response.use.err");
            
    const originalConfig = err.config;
    
    // console.error("axios.interceptors.response Error: ", err);

    if (err.response.status === 401 && !originalConfig._retry) {
      try {
        originalConfig._retry = true;

        const rs = await api.post(API_URL.REFRESH_TOKEN, {
          refreshToken: jwtToken.refreshToken, //TokenService.getLocalRefreshToken(),
        });

        // console.log("api.refreshToke done: ", rs);

        jwtToken = {...jwtToken, ...rs.data};
        //TokenService.updateLocalToken(token);

        const followup = api(originalConfig);
        return Promise.resolve( followup );

      } catch (_err) {
        console.error(_err);
        return Promise.reject(_err);
      }
    } 
      
    console.log("Non 401 error", err.response.status, err);

    return Promise.reject(err);
  }
);
export default api;
