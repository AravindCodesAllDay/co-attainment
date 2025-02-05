import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddCourseModal from "./AddCourse.modal";

const ViewCourses = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { semesterId } = useParams();
  const { bundleId } = useParams();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/course/${bundleId}/${semesterId}/${
          user.userId
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCourses(data);
      // console.log(data);
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
      <div className="grid grid-cols-4 gap-4 p-4 ">
        {loading ? (
          <div className="flex justify-center mt-4 text-2xl ">Loading...</div>
        ) : error ? (
          <div className="flex justify-center mt-4">{error}</div>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course._id}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() =>
                navigate(
                  `/courses/${bundleId}/${semesterId}/${course.courseId}`
                )
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
