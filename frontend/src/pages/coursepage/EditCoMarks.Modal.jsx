import React, { useState } from "react";

const EditCoMarksModal = ({ student, rows, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ ...student });

  const handleInputChange = (e, row) => {
    setFormData({
      ...formData,
      scores: {
        ...formData.scores,
        [row]: e.target.value,
      },
    });
  };

  const handleSubmit = () => {
    const total = Object.values(formData.scores).reduce(
      (sum, val) => sum + parseFloat(val || 0),
      0
    );
    const average = (total / rows.length).toFixed(2);
    onSubmit({ ...formData, averageScore: average });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h3 className="text-lg font-semibold mb-4">Edit Marks</h3>
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="flex justify-between">
              <label className="text-gray-700">{row}:</label>
              <input
                type="number"
                value={formData.scores[row] || ""}
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
