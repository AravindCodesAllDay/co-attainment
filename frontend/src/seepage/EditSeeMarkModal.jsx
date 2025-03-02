import React, { useState } from "react";
import { useParams } from "react-router-dom";
import close from "../../assets/close.svg";

export default function EditSeeMarkModal({ student, onClose, fetchStudent }) {
  const { batchId, semesterId } = useParams();
  const [formData, setFormData] = useState({
    name: student.name,
    rollno: student.rollno,
    scores: { ...student.scores }, // Clone scores object
  });

  const handleChange = (e, course) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      scores: {
        ...prevState.scores,
        [course]: Number(value), // Ensure numeric values
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/see`, 
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            rollno: formData.rollno,
            semId: semesterId,
            batchId,
            scores: formData.scores,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update marks");
      }
      fetchStudent(); // Refresh list
      onClose();
    } catch (error) {
      console.error("Error updating marks:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded shadow-lg w-full max-w-3xl h-3/4 overflow-y-auto">
        <img
          src={close}
          onClick={onClose}
          className="absolute top-2 right-2 cursor-pointer"
          alt="Close"
        />
        <h2 className="text-xl font-bold mb-4">Edit Student Marks</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Roll No</label>
            <input
              type="text"
              value={formData.rollno}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>
          {/* Render all courses dynamically */}
          {Object.keys(formData.scores).map((course, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 font-bold">
                {course.toUpperCase()}
              </label>
              <input
                type="number"
                value={formData.scores[course] || 0} // Default to 0 if no value
                onChange={(e) => handleChange(e, course)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
