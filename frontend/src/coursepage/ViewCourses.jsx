import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddCourseModal from "./AddCourseModal";

const ViewCourses = () => {
  const navigate = useNavigate();
  const { batchId, semesterId } = useParams();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/course/${batchId}/${semesterId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
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
      <div className="flex justify-end p-2 font-primary">
        <button
          onClick={toggleModal}
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
        >
          Add Course
        </button>
      </div>
      <AddCourseModal
        isModalOpen={isModalOpen}
        toggleModal={toggleModal}
        fetchCourses={fetchCourses}
      />
      <div className="grid grid-cols-4 gap-4 p-4 ">
        {loading ? (
          <div className="flex justify-center mt-4 text-2xl ">Loading...</div>
        ) : error ? (
          <div className="flex justify-center mt-4">{error}</div>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.courseId}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() =>
                navigate(`/courses/${batchId}/${semesterId}/${course.courseId}`)
              }
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
