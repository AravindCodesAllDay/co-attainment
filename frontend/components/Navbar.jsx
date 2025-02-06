import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import logo from "../assets/nothinglogo.jpg";
import profile from "../assets/profile.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchId, semesterId } = useParams();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const verifyUserToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found. Redirecting to login.");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API}/user/verifytoken`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.clear();
        navigate("/");
      }
    };

    verifyUserToken();
  }, [batchId, semesterId, navigate]);

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
      { label: "Namelists", path: `/namelists/${batchId}` },
      { label: "Sems", path: `/sem/${batchId}` }
    );
  }
  if (
    location.pathname.startsWith("/courses") ||
    location.pathname.startsWith("/ptlists") ||
    location.pathname.startsWith("/see") ||
    location.pathname.startsWith("/coattainment")
  ) {
    navLinks.push(
      { label: "Course", path: `/courses/${batchId}/${semesterId}` },
      { label: "PtLists", path: `/ptlists/${batchId}/${semesterId}` },
      { label: "See", path: `/see/${batchId}/${semesterId}` },
      {
        label: "Co-attainment",
        path: `/coattainment/${batchId}/${semesterId}`,
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
    <div className="bg-sky-400 p-3 flex items-center w-full gap-6 relative">
      <img
        className="cursor-pointer size-10 rounded-full"
        src={logo}
        alt="nothing logo"
        onClick={() => navigate("/dashboard")}
      />
      <ul className="flex gap-6 text-white font-bold">
        {navLinks.map((link) => (
          <li
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`
              ${
                location.pathname.startsWith(link.path) ? "text-black" : ""
              } cursor-pointer
            `}
          >
            {link.label}
          </li>
        ))}
      </ul>
      <div className="ml-auto relative" ref={dropdownRef}>
        <img
          className="cursor-pointer size-8"
          src={profile}
          alt="Profile"
          onClick={changeDropdownOpen}
        />
        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg p-1">
            <div
              className="block p-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
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
