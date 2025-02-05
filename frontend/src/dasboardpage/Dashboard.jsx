// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddbatchModal from "./Addbatch.modal";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    fetchbundle();
  };

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
  };

  const fetchbundle = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/bundle/${user.userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setItems(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching namelist", error);
      setError("Failed to fetch student data");
    }
  };

  useEffect(() => {
    fetchbundle();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          onClick={handleOpenModal}
          className="bg-green-600 text-xl p-2 w-fit text-white border-none rounded-md mt-4"
        >
          Add Batch
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4 ">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
            onClick={() => navigate(`/namelists/${item.bundleId}`)}
          >
            {item.title}
          </div>
        ))}
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
