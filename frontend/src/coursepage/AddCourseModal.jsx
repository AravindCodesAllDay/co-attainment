import React, { useState } from "react";
import close from "../../assets/close.svg";
import { useParams } from "react-router-dom";

const AddCourseModal = ({ isModalOpen, toggleModal, fetchCourses }) => {
  if (!isModalOpen) return null;
  const { batchId, semesterId } = useParams();

  const [title, setTitle] = useState("");
  const [rows, setRows] = useState([""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTableRow = () => {
    setRows([...rows, ""]);
  };

  const handleTableRowChange = (tableRowIndex, event) => {
    const values = [...rows];
    values[tableRowIndex] = event.target.value;
    setRows(values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title,
          batchId,
          semId: semesterId,
          rows,
        }),
      });

      if (response.ok) {
        toggleModal();
        fetchCourses();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit the course.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setError("An error occurred while submitting the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-2">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-end">
          <h1 className="mr-auto text-xl text-blue-700 font-bold">Co-List</h1>
          <button
            onClick={toggleModal}
            className="text-sm p-2 w-fit text-white border-2 border-none rounded-md mb-4 items-end"
          >
            <img className="cursor-pointer" src={close} alt="Close" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter the Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-2 mb-2 rounded"
            />

            {rows.map((tableRow, tableRowIndex) => (
              <input
                key={tableRowIndex}
                type="text"
                placeholder="Table Row Name"
                value={tableRow}
                onChange={(e) => handleTableRowChange(tableRowIndex, e)}
                className="border border-gray-300 p-2 mb-2 rounded-lg"
              />
            ))}
            <button
              type="button"
              onClick={handleAddTableRow}
              className="bg-blue-600 text-sm p-2 w-fit text-white border-2 border-none rounded-md mt-1 mb-4"
            >
              Add Table Row
            </button>
          </div>

          <div className="space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-xl p-2 w-44 text-white border-2 border-none rounded-md mt-4"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default AddCourseModal;
