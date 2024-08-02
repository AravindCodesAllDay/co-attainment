import React, { useState } from "react";
import { useParams } from "react-router-dom";

const AddNamelistModal = ({ showModal, toggleModal, bundleId }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const bundle = bundleId;
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    if (!title || !bundleId) {
      setError("Title and Bundle ID are required.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/namelist/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: title, bundleId: bundle }),
        }
      );

      if (response.ok) {
        setTitle("");
        toggleModal();
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred.");
      }
    } catch (error) {
      setError("An error occurred while submitting the form.");
    }
  };

  const handleClickInsideModal = (e) => {
    e.stopPropagation(); // Stop propagation to prevent modal from closing
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
        <button
          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
          onClick={toggleModal}
        >
          X
        </button>
        <h2 className="text-xl font-bold mb-4">Add Title</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-4"
            onClick={handleClickInsideModal} // Prevent modal from closing on input click
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNamelistModal;
