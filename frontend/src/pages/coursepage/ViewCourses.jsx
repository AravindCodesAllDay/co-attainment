import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddCourseModal from "./AddCourse.modal";

const ViewCourses = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/course/${user.userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          onClick={toggleModal}
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
        >
          Add Course
        </button>
      </div>
      <AddCourseModal isModalOpen={isModalOpen} toggleModal={toggleModal} />
      <div className="grid grid-cols-4 gap-4 items-center mt-4 p-6">
        {loading ? (
          <div className="flex justify-center mt-4 text-2xl ">Loading...</div>
        ) : error ? (
          <div className="flex justify-center mt-4">{error}</div>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course._id}
              className="border p-2 m-2 w-3/4 rounded bg-gray-100 cursor-pointer hover:bg-sky-500 font-bold hover:text-white"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              {course.title}
            </div>
          ))
        ) : (
          <div className="flex justify-center mt-4">No courses available</div>
        )}
      </div>
    </>
  );
};

export default ViewCourses;
