import React from "react";
import Modal from "react-modal";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./index.css";

import Layout from "./layout";
import ViewCourse from "./coursepage/ViewCourse";
import ViewCourses from "./coursepage/ViewCourses";
import Login from "./loginpage/Login";
import Create from "./loginpage/Create";
import ViewNamelist from "./namelistpage/ViewNamelist";
import ViewNamelists from "./namelistpage/ViewNamelists";
import ViewPtList from "./ptpage/ViewPtList";
import ViewPtLists from "./ptpage/ViewPtLists";
import SelectCoatt from "./co-attainment/SelectCoatt";
import ViewSaas from "./saapage/ViewSaas";
import ViewSaa from "./saapage/ViewSaa";
import Dashboard from "./dasboardpage/Dashboard";
import ViewSems from "./sempage/ViewSems";
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
          <Route path="/namelists/:batchId" element={<ViewNamelists />} />
          <Route
            path="/namelists/:batchId/:namelistId"
            element={<ViewNamelist />}
          />
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
            path="/ptlists/:batchId/:semesterId/:ptlistid"
            element={<ViewPtList />}
          />
          <Route path="/see/:batchId/:semesterId" element={<ViewSaas />} />
          <Route
            path="/see/:batchId/:semesterId/:seeid"
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
