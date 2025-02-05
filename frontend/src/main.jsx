import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import Modal from "react-modal";
import "./index.css";

import ViewCourse from "./coursepage/ViewCourse";
import ViewCourses from "./coursepage/ViewCourses";
import Login from "./loginpage/Login";
import ViewNamelist from "./namelistpage/ViewNamelist";
import ViewNamelists from "./namelistpage/ViewNamelists";
import ViewPtList from "./ptpage/ViewPtList";
import ViewPtLists from "./ptpage/ViewPtLists";
import SelectCoatt from "./co-attainment/SelectCoatt";
import ViewSaas from "./saapage/ViewSaas";
import ViewSaa from "./saapage/ViewSaa";
import Dashboard from "./dasboardpage/Dashboard";
import ViewSems from "./sempage/ViewSems";

Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/namelists/:bundleId" element={<ViewNamelists />} />

        <Route
          path="/namelists/:bundleId/:namelistId"
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
