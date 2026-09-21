import { Link } from "react-router-dom";
const Megamenu = () => {
  return (
    <div className="group">
      <button className="hover:text-green-400 transition border-b-2 border-white hover:border-green-400 cursor-pointer pt-6 text-white">
        Teams
      </button>
      <div className="hidden group-hover:flex flex-col absolute left-0 top-[6rem] p-10 w-full bg-black z-20 text-black duration-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="flex flex-col">
            <h3 className="mb-4 text-2xl text-white">Teams Selection</h3>
            <Link to="/instructor" className="underline text-white">
              Instructors
            </Link>
            <Link to="/student" className="underline text-white">
              Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Megamenu;
