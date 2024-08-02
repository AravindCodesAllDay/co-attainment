import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import logo from "../assets/nothinglogo.jpg";
import profile from "../assets/profile.svg";

const Navbar = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkLogin = () => {
      if (!user) {
        navigate("/");
      }
    };
    checkLogin();
  }, [navigate, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onExit = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleMouseEnter = () => {
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setDropdownOpen(false);
  };

  const renderNavLinks = () => {
    switch (location.pathname) {
      case "/dashboard":
        return (
          <div className=" ml-auto justify-center text-white text-xl">
            <h1>CSBS Admin Profile</h1>
          </div>
        );
      case `/namelists/${bundleId}`:
      case `/sem/${bundleId}`:
        return (
          <div className="flex flex-row gap-6 justify-center items-center font-bold text-white cursor-pointer">
            <h2 onClick={() => navigate(`/namelists/${bundleId}`)}>Namelist</h2>
            <h2 onClick={() => navigate(`/sem/${bundleId}`)}> Sems</h2>
          </div>
        );
      case "/courses":
      case "/ptlists":
        return (
          <div className="flex flex-row gap-6 justify-center items-center font-bold text-white cursor-pointer">
            <h2 onClick={() => navigate("/courses")}>Course</h2>
            <h2 onClick={() => navigate("/ptlists")}>PtLists</h2>
          </div>
        );
      default:
        return (
          <div className="flex flex-row gap-6 justify-center items-center font-bold text-white cursor-pointer">
            <h2 onClick={() => navigate(`/namelists/${bundleId}`)}>Namelist</h2>
            <h2 onClick={() => navigate("/courses")}>Course</h2>
            <h2 onClick={() => navigate("/ptlists")}>PtLists</h2>
            <h2 onClick={() => navigate("/saa")}>Saa</h2>
          </div>
        );
    }
  };

  return (
    <div
      className="bg-sky-600 p-3 items-center flex flex-row w-screen gap-6 relative"
      onMouseLeave={handleMouseLeave}
    >
      <img
        className="ml-12 cursor-pointer size-12 rounded-full"
        src={logo}
        alt="SITLOGO"
      />
      {renderNavLinks()}
      <div
        className="ml-auto relative"
        ref={dropdownRef}
        onMouseEnter={handleMouseEnter}
      >
        <img
          className="cursor-pointer"
          onClick={() => navigate("/dashboard")}
          src={profile}
          alt="Profile"
        />
        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg p-2">
            <div
              className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer border-b-2"
              onClick={() => navigate("/coattainment")}
            >
              Create Co
            </div>
            <div
              className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
              onClick={onExit}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
