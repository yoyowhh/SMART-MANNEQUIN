import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { CiMenuFries } from "react-icons/ci";
import Megamenu from "./Megamenu";
import Content from "./Content";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const navRef = useRef();

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    const visible = prevScrollPos > currentScrollPos;

    setIsVisible(visible);
    setPrevScrollPos(currentScrollPos);
  };

  const handleMouseMove = (event) => {
    if (event.clientY < 50) {
      setIsVisible(true);
    }
  };

  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [prevScrollPos]);

  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const content = (
    <>
      <Content></Content>
    </>
  );

  return (
    <nav
      ref={navRef}
      className={`z-50 fixed w-full transition-all bg-black duration-2000 ${isVisible ? "visible" : "invisible"}`}>
      <div className="h-10vh flex justify-between lg:py-5 px-20 py-8">
        <div className="flex items-center flex-1">
          <Link>
            <img src="bu/images/stas-rg/logo_stas.png" className="h-20 w-25" />
          </Link>
        </div>
        <div className="lg:flex md-flex flex-1 justify-end items font-normal hidden">
          <ul className="flex gap-[10rem] mr-10 text-[20px]">
            <Link to="/">
              <li className="hover:text-green-400 transition border-b-2 text-white border-white hover:border-green-400 cursor-pointer pt-6">
                Home
              </li>
            </Link>
            <Megamenu></Megamenu>
            <Link to="/livescreen">
              <li className="hover:text-green-400 transition border-b-2 text-white border-white hover:border-green-400 cursor-pointer pt-6">
                LiveScreen
              </li>
            </Link>
          </ul>
        </div>
        <div className="">{click && content}</div>
        <button
          className="block lg:hidden transition:none"
          onClick={handleClick}>
          {click ? (
            <FaTimes className="text-white h-[3em] w-[1em]" />
          ) : (
            <CiMenuFries className="text-white h-[3em] w-[2em]" />
          )}
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
