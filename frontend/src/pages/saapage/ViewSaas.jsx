import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import AddSaamodal from "./AddSaa.modal"; // Adjust the import path as needed

function ViewSaas() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-row justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
          onClick={handleOpenModal}
        >
          Add Saa
        </button>
      </div>
      {isModalOpen && <AddSaamodal handleClose={handleCloseModal} />}
    </>
  );
}

export default ViewSaas;
