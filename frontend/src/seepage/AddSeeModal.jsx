import React, { useState, useEffect } from "react";
import close from "../../assets/close.svg";
import { useParams } from "react-router-dom";

const AddSeeModal = ({ onClose, fetchStudent }) => {
  const { batchId, semesterId } = useParams();
  const [courses, setCourses] = useState([]);
  const [cotypes, setCotypes] = useState([]); // Holds dropdown values
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch course types for dropdown
  const fetchCotypes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/cotype`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCotypes(data);
    } catch (error) {
      console.error("Error fetching cotypes:", error);
      setError("Failed to fetch cotypes");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing course headers
  const fetchHeaders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/see/headers/${batchId}/${semesterId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch headers");
      }
      const headers = await response.json();
      
      // Prepopulate courses with fetched data
      const formattedHeaders = headers.map((header, index) => ({
        id: index + 1,
        value: header, // Assuming header contains the course value
      }));
      setCourses(formattedHeaders.length > 0 ? formattedHeaders : [{ id: 1, value: "" }]);
    } catch (error) {
      console.error("Failed to fetch headers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCotypes();
    fetchHeaders();
  }, []);

  const handleAddCourse = () => {
    setCourses([...courses, { id: courses.length + 1, value: "" }]);
  };

  const handleCourseChange = (id, value) => {
    const updatedCourses = courses.map((course) =>
      course.id === id ? { ...course, value } : course
    );
    setCourses(updatedCourses);
  };

  const handleRemoveCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formattedCourses = courses.map((course) => course.value);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/see`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          batchId,
          semId: semesterId,
          courses: formattedCourses,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      fetchStudent();
      onClose();
    } catch (error) {
      setError("Failed to post the data. Please try again later.");
      console.error("Failed to post the data in the see:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <img
          src={close}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          onClick={onClose}
          alt="Close"
        />
        <h2 className="text-2xl font-bold mb-4">Add See Details</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Courses
            </label>
            {courses.map((course) => (
              <div key={course.id} className="flex items-center space-x-2 mb-2">
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={course.value}
                  onChange={(e) => handleCourseChange(course.id, e.target.value)}
                >
                  <option value="">Select Course</option>
                  {cotypes.map((cotype, index) => (
                    <option key={index} value={cotype}>
                      {cotype}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                  onClick={() => handleRemoveCourse(course.id)}
                  disabled={courses.length === 1} 
                >
                  Remove
                </button>
              </div>
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
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSeeModal;
