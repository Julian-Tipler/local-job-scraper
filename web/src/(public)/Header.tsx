// Header.js
import { Link } from "react-router-dom";
import { ROUTES } from "../utils/routes";

export const Header = () => {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to={ROUTES.create.path}>Create</Link>
    </nav>
  );
};
