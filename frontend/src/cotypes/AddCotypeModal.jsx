import React, { useState } from "react";
import Modal from "react-modal";
import close from "../../assets/close.svg";

const AddCotypeModal = ({ isOpen, onRequestClose, fetchCotypes }) => {
  const [cotype, setCotype] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cotype.trim()) {
      setError("Cotype cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/cotype`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ cotype }),
      });

      if (!response.ok) {
        throw new Error("Failed to add cotype");
      }

      setCotype("");
      fetchCotypes();
      onRequestClose();
    } catch (error) {
      setError("An error occurred while adding the cotype");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Cotype"
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
      overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-75"
      ariaHideApp={false}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md mx-auto">
        <button
          onClick={onRequestClose}
          className="absolute top-2 right-2 text-gray-700"
        >
          <img className="cursor-pointer" src={close} alt="Close" />
        </button>
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <p className="mb-4 font-semibold text-lg">Add Cotype</p>
          <div className="mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Cotype:
            </label>
            <input
              type="text"
              value={cotype}
              onChange={(e) => setCotype(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter Cotype"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
          {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        </form>
      </div>
    </Modal>
  );
};

export default AddCotypeModal;
