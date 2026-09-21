import { Link } from "react-router-dom";

const Content = () => {
  return (
    <div className="lg:hidden z-50 block absolute top-20 w-full left-0 right-0 bg-slate-500 backdrop-blur bg-opacity-60 transition">
      <ul className="text-center text-xl p-10">
        <Link to="/">
          <li className="my-4 py-4 border-b border-green-200 text-green-200 hover:text-green-950 transition-all duration-150 hover:bg-green-200 hover-rounded">
            Home
          </li>
        </Link>
        <Link to="/instructor">
          <li className="my-4 py-4 border-b border-green-200 text-green-200 hover:text-green-950 transition-all duration-150 hover:bg-green-200 hover-rounded">
            Teams
          </li>
        </Link>
        <Link to="/">
          <li className="my-4 py-4 border-b border-green-200 text-green-200 hover:text-green-950 transition-all duration-150 hover:bg-green-200 hover-rounded">
            LiveScreen
          </li>
        </Link>
      </ul>
    </div>
  );
};
export default Content;
