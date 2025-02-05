import React, { useEffect, useState } from "react";
import close from "../../assets/close.svg";

const AddbatchModal = ({ show, onClose, onAddItem }) => {
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleCloseClick = (e) => {
    if (e.target.id === "modal-wrapper") {
      onClose();
    }
  };

  const postbun = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title: batchName,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Bundle Created:", result);
      if (batchName.trim()) {
        onAddItem(batchName);
        setBatchName("");
        onClose();
      }
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="modal-wrapper"
      className="fixed inset-0 flex justify-center items-center bg-black/50"
      onClick={handleCloseClick}
    >
      <div className="bg-white p-4 rounded-md shadow-lg relative">
        <img
          onClick={onClose}
          className="absolute top-2 right-2 text-xl cursor-pointer"
          src={close}
        />
        <h2 className="text-xl mb-4 font-bold">Add Batch</h2>
        <form onSubmit={postbun}>
          <label className="block mb-2">
            Batch Name:
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="border p-2 w-full mt-1"
              disabled={loading}
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddbatchModal;
