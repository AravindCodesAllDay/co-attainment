import React, { useState } from "react";
import close from "../../assets/close.svg";

const AddbundleModal = ({ show, onClose, onAddItem }) => {
  const [bundleName, setBundleName] = useState("");

  if (!show) return null;

  const handleCloseClick = (e) => {
    if (e.target.id === "modal-wrapper") {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bundleName.trim()) {
      onAddItem(bundleName);
      setBundleName("");
      onClose();
    }
  };

  return (
    <div
      id="modal-wrapper"
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
      onClick={handleCloseClick}
    >
      <div className="bg-white p-4 rounded-md shadow-lg relative">
        <img
          onClick={onClose}
          className="absolute top-2 right-2 text-xl cursor-pointer"
          src={close}
        />
        <h2 className="text-xl mb-4 font-bold">Add Bundle</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Bundle Name:
            <input
              type="text"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              className="border p-2 w-full mt-1"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddbundleModal;
