import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import logo from "../assets/nothinglogo.jpg";
import profile from "../assets/profile.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bundleId, semesterId } = useParams();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
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

  const navLinks = [];

  if (
    location.pathname.startsWith("/namelists") ||
    location.pathname.startsWith("/sem")
  ) {
    navLinks.push(
      { label: "Namelist", path: `/namelists/${bundleId}` },
      { label: "Sems", path: `/sem/${bundleId}` }
    );
  }
  if (
    location.pathname.startsWith("/courses") ||
    location.pathname.startsWith("/ptlists") ||
    location.pathname.startsWith("/see") ||
    location.pathname.startsWith("/coattainment")
  ) {
    navLinks.push(
      { label: "Course", path: `/courses/${bundleId}/${semesterId}` },
      { label: "PtLists", path: `/ptlists/${bundleId}/${semesterId}` },
      { label: "See", path: `/see/${bundleId}/${semesterId}` },
      {
        label: "Co-attainment",
        path: `/coattainment/${bundleId}/${semesterId}`,
      }
    );
  }
  if (navLinks.length === 0) {
    navLinks.push({ label: "Dashboard", path: "/dashboard" });
  }

  function changeDropdownOpen() {
    setDropdownOpen(!dropdownOpen);
  }

  return (
    <div className="bg-sky-600 p-3 flex items-center w-screen gap-6 relative">
      <img
        className="ml-12 cursor-pointer size-12 rounded-full"
        src={logo}
        alt="SITLOGO"
        onClick={() => navigate("/dashboard")}
      />
      <div className="flex gap-6 text-white font-bold">
        {navLinks.map((link) => (
          <h2
            key={link.path}
            onClick={() => navigate(link.path)}
            className={
              location.pathname === link.path ? "text-black" : "cursor-pointer"
            }
          >
            {link.label}
          </h2>
        ))}
      </div>
      <div className="ml-auto relative" ref={dropdownRef}>
        <img
          className="cursor-pointer"
          src={profile}
          alt="Profile"
          onClick={changeDropdownOpen}
        />
        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg p-2">
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
