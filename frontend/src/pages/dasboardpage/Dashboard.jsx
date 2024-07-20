import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddbundleModal from "./Addbundle.modal"; // Assuming you place the Modal component in the components folder

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          onClick={handleOpenModal}
          className="bg-green-600 text-xl p-2 w-fit text-white border-none rounded-md mt-4"
        >
          Add Bundle
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4 ">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
            onClick={() => navigate("/namelists")}
          >
            {item}
          </div>
        ))}
      </div>
      <AddbundleModal
        show={showModal}
        onClose={handleCloseModal}
        onAddItem={handleAddItem}
      />
    </>
  );
}

export default Dashboard;
