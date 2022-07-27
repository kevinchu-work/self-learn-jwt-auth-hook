import React, { useState, useRef } from "react";
import { Router } from "@reach/router";
import useAuth from "../hooks/useAuth";
import useAPI, { API_URL } from "../api/api";
import jwt_decode from "jwt-decode";

const Index = () => {
  const loginRef = useRef();
  const pwdRef = useRef();

  const [consoleLog, setConsoleLog] = useState("");

  const { auth, setAuth } = useAuth();
  const api = useAPI();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // const email = loginRef.current.value;
      // const password = pwdRef.current.value;
      const postBody = JSON.stringify({ 'email': loginRef.current.value, 'password': pwdRef.current.value });
      console.log(postBody);

      const response = await api.post(
        API_URL.LOGIN,
        postBody,
      );

      const decodedToken = jwt_decode(response.data);
      console.log('decode', decodedToken);

      setAuth(decodedToken);

    } catch (err) {
      console.log("handleLogin Error", err);
      // setConsoleLog( )
    }
  };

  const onValueChange = () => {

  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="loginid">Login ID</label>
        <input
          ref={loginRef}
          onChange={onValueChange}
          id="loginid"
          name="loginid"
          placeholder="login id"
          value="system@smls.io"
          required
        />
      </div>

      <div>
        <label htmlFor="pwd">Password</label>
        <input
          ref={pwdRef}
          onChange={onValueChange}
          id="pwd"
          name="pwd"
          type="password"
          value="321Pa$$word!"
          required
        />
      </div>

      <button type="submit">Login</button>

      {auth && <div>auth</div>}

      {!auth && <div>not auth</div>}

      <div>
        { consoleLog }
      </div>
    </form>
  );
};
export default Index;
