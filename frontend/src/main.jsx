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
import ViewSaas from "./pages/saapage/ViewSaas";
import ViewSaa from "./pages/saapage/ViewSaa";
import Dashboard from "./pages/dasboardpage/Dashboard";
import ViewSems from "./pages/sempage/ViewSems";

// Set the app element for react-modal
Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/namelists/:bundleId" element={<ViewNamelists />} />
        <Route
          path="/namelists/:namelistId/:bundleId"
          element={<ViewNamelist />}
        />

        <Route path="/sem/:bundleId" element={<ViewSems />} />

        <Route
          path="/courses/:bundleId/:semesterId/"
          element={<ViewCourses />}
        />
        <Route
          path="/courses/:bundleId/:semesterId/:courseId/"
          element={<ViewCourse />}
        />

        <Route
          path="/ptlists/:bundleId/:semesterId"
          element={<ViewPtLists />}
        />
        <Route
          path="/ptlists/:bundleId/:semesterId/:ptlistid"
          element={<ViewPtList />}
        />

        <Route
          path="/coattainment/:bundleId/:semesterId"
          element={<SelectCoatt />}
        />

        <Route path="/see/:bundleId/:semesterId" element={<ViewSaas />} />
        <Route path="/see/:bundleId/:semesterId/:seeid" element={<ViewSaa />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
