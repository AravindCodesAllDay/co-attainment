import React, { useState, useEffect } from "react";
import close from "../../assets/close.svg";
import { useParams } from "react-router-dom";

const AddSeeModal = ({ handleClose }) => {
  const [courses, setCourses] = useState([{ id: 1, value: "" }]);
  const { bundleId, semesterId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const [namelistId, setNamelistId] = useState("");
  const [title, setTitle] = useState("");
  const [titles, setTitles] = useState([]);
  const [see, setsee] = useState([]);
  const [seefetch, setseefetch] = useState([]);

  const handleAddCourse = () => {
    setCourses([...courses, { id: courses.length + 1, value: "" }]);
  };

  const handleCourseChange = (id, value) => {
    const updatedCourses = courses.map((course) =>
      course.id === id ? { ...course, value } : course
    );
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedCourses = courses.map((course) => course.value);
    console.log({
      title,
      namelistId,
      bundleId,
      semId: semesterId,
      courses: formattedCourses,
    });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/see/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            namelistId,
            bundleId,
            semId: semesterId,
            courses: formattedCourses,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setsee(data);
    } catch (error) {
      console.log("Failed to post the data in the see");
    }
  };

  const fetchTitles = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/see/${bundleId}/${semesterId}/${
          user.userId
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setseefetch(data);
    } catch (error) {
      console.error("Failed to fetch titles:", error);
    }
  };

  useEffect(() => {
    fetchTitles();
  }, [user.userId]);

  useEffect(() => {
    const fetchNamelists = async () => {
      if (user.userId && bundleId) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API}/namelist/${bundleId}/${user.userId}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setTitles(data);
        } catch (error) {
          console.log("Error while fetching:", error);
        }
      } else {
        console.log("User not found in localStorage or bundleId missing");
      }
    };

    fetchNamelists();
  }, [user.userId, bundleId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <img
          src={close}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          onClick={handleClose}
        />
        <h2 className="text-2xl font-bold mb-4">Add Saa Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name List
            </label>
            <select
              name="namelist"
              value={namelistId}
              onChange={(e) => setNamelistId(e.target.value)}
              className="border border-gray-300 p-2 mb-2 rounded-lg w-full"
            >
              <option value="" disabled>
                Select namelist
              </option>
              {titles.map((title) => (
                <option key={title.namelistId} value={title.namelistId}>
                  {title.title}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Courses
            </label>
            {courses.map((course) => (
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 m-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={course.value}
                key={course.id}
                onChange={(e) => handleCourseChange(course.id, e.target.value)}
              >
                <option value="">Select Course</option>
                {/* Add course options here */}
                <option value="Understand">Understand</option>
                <option value="Analyse">Analyse</option>
                <option value="Apply">Apply</option>
              </select>
            ))}
          </div>
          <button
            className="bg-blue-600 text-white p-2 rounded mt-2"
            type="button"
            onClick={handleAddCourse}
          >
            Add Course
          </button>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              className="bg-green-600 text-white p-2 rounded"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSeeModal;
