import React, { useState } from "react";
import { useParams } from "react-router-dom";

const EditCoMarksModal = ({ student, structure = {}, onClose }) => {
  const { batchId, courseId, semesterId } = useParams();
  const [formData, setFormData] = useState({ ...student });

  const handleInputChange = (e, row) => {
    setFormData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [row]: e.target.value },
    }));
  };

  const handleSubmit = async () => {
    try {
      const total = Object.values(formData.scores || {}).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      );
      const average = (total / Object.keys(structure).length).toFixed(2);

      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/course`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ 
          ...formData, 
          averageScore: average, 
          coId: courseId, 
          batchId, 
          semId: semesterId 
        }),
      });

      if (!response.ok) throw new Error("Failed to update scores");

      onClose(await response.json());
    } catch (error) {
      console.error("Error while updating scores:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h3 className="text-lg font-semibold mb-4">Edit Marks</h3>
        <div className="space-y-4">
          {Object.keys(structure).map((row, index) => (
            <div key={index} className="flex justify-between">
              <label className="text-gray-700">{row}:</label>
              <input
                type="number"
                value={formData.scores?.[row] || ""}
                onChange={(e) => handleInputChange(e, row)}
                className="border rounded px-2 py-1 w-20 text-right"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Close
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCoMarksModal;
