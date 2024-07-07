import React, { useState } from "react";
import close from "../../assets/close.svg";

const AddSaamodal = ({ handleClose }) => {
  const [courses, setCourses] = useState([{ id: 1, value: "" }]);

  const handleAddCourse = () => {
    setCourses([...courses, { id: courses.length + 1, value: "" }]);
  };

  const handleCourseChange = (id, value) => {
    const updatedCourses = courses.map((course) =>
      course.id === id ? { ...course, value } : course
    );
    setCourses(updatedCourses);
  };

  const handleSubmit = async () => {
    e.preventDefault();
    try {
    } catch (error) {}
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <img
          src={close}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          onClick={handleClose}
        />
        <h2 className="text-2xl font-bold mb-4">Add Saa Details</h2>
        <form onClick={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name List
            </label>
            <select className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Select Name</option>
              {/* Add more options as needed */}
            </select>
          </div>
          {courses.map((course) => (
            <div className="mb-4" key={course.id}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Courses
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={course.value}
                onChange={(e) => handleCourseChange(course.id, e.target.value)}
              >
                <option value="">Select Course</option>
                {/* Add course options here */}
                <option value="course1">Course 1</option>
                <option value="course2">Course 2</option>
                <option value="course3">Course 3</option>
              </select>
            </div>
          ))}
          <button
            className="bg-blue-600 text-white p-2 rounded mt-2"
            type="button"
            onClick={handleAddCourse}
          >
            Create Courses
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

export default AddSaamodal;
