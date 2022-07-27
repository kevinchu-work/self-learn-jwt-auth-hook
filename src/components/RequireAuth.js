import useAuth from "../hooks/useAuth";
import _ from "lodash";

const RequireAuth = ({ allowedRoles, children }) => {
  const { auth } = useAuth();

  const castRoles = _.castArray(allowedRoles);
  const permissionFlags = _.castArray(auth?.roles).map((role) =>
    castRoles.includes(role)
  );
  const flag = permissionFlags.includes(true);

  return flag ? <>{children}</> : <div>Unauthorized</div>;
};
export default RequireAuth;
