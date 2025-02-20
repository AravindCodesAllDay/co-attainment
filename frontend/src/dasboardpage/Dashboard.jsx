import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AddbatchModal from "./AddbatchModal";

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    fetchbatch();
  };

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
  };

  const fetchbatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/batch`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching namelist", error);
      setError("Failed to fetch batch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchbatch();
  }, []);

  return (
    <>
      <div className="flex justify-end p-2 font-primary">
        <button
          onClick={handleOpenModal}
          className="bg-green-600 text-xl p-2 w-fit text-white border-none rounded-md mt-4"
        >
          Add Batch
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4 ">
        {loading ? (
          <p className="text-center col-span-4">Loading batches...</p>
        ) : error ? (
          <p className="text-center col-span-4 text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-center col-span-4 text-gray-500">
            No batches available.
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(`/sem/${item.batchId}`)}
            >
              {item.title}
            </div>
          ))
        )}
      </div>
      <AddbatchModal
        show={showModal}
        onClose={handleCloseModal}
        onAddItem={handleAddItem}
      />
    </>
  );
}

export default Dashboard;
