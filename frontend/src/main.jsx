import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Modal from "react-modal";
import "./index.css";
import ViewCourse from "./pages/coursepage/ViewCourse";
import ViewCourses from "./pages/coursepage/ViewCourses";
import Login from "./pages/loginpage/Login";
import ViewNamelist from "./pages/namelistpage/ViewNamelist";
import ViewNamelists from "./pages/namelistpage/ViewNamelists";
import ViewPtList from "./pages/ptpage/ViewPtList";
import ViewPtLists from "./pages/ptpage/ViewPtLists";
import SelectCoatt from "./pages/co-attainment/SelectCoatt";

// Set the app element for react-modal
Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/namelists" element={<ViewNamelists />} />
        <Route path="/namelists/:namelistid" element={<ViewNamelist />} />
        <Route path="/courses" element={<ViewCourses />} />
        <Route path="/courses/:courseid" element={<ViewCourse />} />
        <Route path="/ptlists" element={<ViewPtLists />} />
        <Route path="/ptlists/:ptlistid" element={<ViewPtList />} />
        <Route path="/coattainment" element={<SelectCoatt />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
