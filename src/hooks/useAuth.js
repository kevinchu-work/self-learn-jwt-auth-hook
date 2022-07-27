import { useContext, useDebugValue } from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
  // for Development
  const { auth } = useContext(AuthContext);
  useDebugValue(auth /* , auth => auth?.xxx */); // TODO: data formatter

  return useContext(AuthContext);
};
export default useAuth;
