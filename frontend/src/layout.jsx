import React from "react";
import { Outlet, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
  const params = useParams(); // Ensures Navbar gets correct params

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
