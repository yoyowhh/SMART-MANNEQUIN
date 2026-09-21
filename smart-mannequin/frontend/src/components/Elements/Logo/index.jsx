import { Link } from "react-router-dom";
const Logo = () => {
  return (
    <div className="logo ">
      <Link to="/">
        <img src="/images/stas-rg/logo_stas.png" alt="logo" className="w-16" />
      </Link>
    </div>
  );
};

export default Logo;
