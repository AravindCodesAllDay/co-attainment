import React, { useState } from "react";
import { useParams } from "react-router-dom";
import close1 from "../../assets/close.svg";

const AddNamelistModal = ({ showModal, toggleModal }) => {
  const { batchId } = useParams();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !batchId) {
      setError("Title and Bundle ID are required.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/namelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title, batchId }),
      });

      if (response.ok) {
        setTitle("");
        toggleModal();
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred.");
      }
    } catch (error) {
      setError("An error occurred while submitting the form.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleClickInsideModal = (e) => {
    e.stopPropagation();
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 font-primary"
      onClick={toggleModal}
    >
      <div
        className="bg-white p-6 z-20 rounded-md relative"
        onClick={handleClickInsideModal}
      >
        <img
          src={close1}
          className="absolute top-2 right-2 p-1 rounded-full cursor-pointer"
          onClick={toggleModal}
        />
        <h2 className="text-xl font-bold mb-4">Add Namelist</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-4"
            onClick={handleClickInsideModal}
            disabled={loading} // Disable input while loading
          />
          <button
            type="submit"
            className={`p-2 rounded w-full ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNamelistModal;
