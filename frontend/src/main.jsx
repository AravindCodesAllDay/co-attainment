import React from "react";
import Modal from "react-modal";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./index.css";

import Layout from "./layout";
import Login from "./loginpage/Login";
import Create from "./loginpage/Create";
import Dashboard from "./dasboardpage/Dashboard";
import ViewNamelist from "./namelistpage/ViewNamelist";
import ViewSems from "./sempage/ViewSems";
import ViewCourses from "./coursepage/ViewCourses";
import ViewCourse from "./coursepage/ViewCourse";
import ViewPtLists from "./ptpage/ViewPtLists";
import ViewPtList from "./ptpage/ViewPtList";
import ViewSaas from "./seepage/ViewSees";
import ViewSaa from "./seepage/ViewSee";
import SelectCoatt from "./co-attainment/SelectCoatt";
import ViewCotypes from "./cotypes/ViewCotypes";

Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/namelists/:batchId" element={<ViewNamelist />} />
          <Route path="/sem/:batchId" element={<ViewSems />} />
          <Route
            path="/courses/:batchId/:semesterId"
            element={<ViewCourses />}
          />
          <Route
            path="/courses/:batchId/:semesterId/:courseId"
            element={<ViewCourse />}
          />
          <Route
            path="/ptlists/:batchId/:semesterId"
            element={<ViewPtLists />}
          />
          <Route
            path="/ptlists/:batchId/:semesterId/:ptlistId"
            element={<ViewPtList />}
          />
          <Route path="/see/:batchId/:semesterId" element={<ViewSaas />} />
          <Route
            path="/see/:batchId/:semesterId/:seeId"
            element={<ViewSaa />}
          />
          <Route path="/cotype" element={<ViewCotypes />} />
          <Route
            path="/coattainment/:batchId/:semesterId"
            element={<SelectCoatt />}
          />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
