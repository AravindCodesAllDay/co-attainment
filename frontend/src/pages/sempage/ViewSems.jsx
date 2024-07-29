import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import Addsemmodal from "./Addsem.modal";

function ViewSems() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sems, setSems] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddSem = (newSem) => {
    setSems([...sems, newSem]);
  };

  // const fetchsem = async () => {
  //   const response = await fetch(`${import.meta.env.VITE_API}/bunsem/sem/`);
  // };

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-none rounded-md mt-4"
          onClick={openModal}
        >
          Add Sem
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        <ul>
          {sems.map((sem, index) => (
            <li
              key={index}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() => navigate("/courses")}
            >
              {sem}
            </li>
          ))}
        </ul>
      </div>
      <Addsemmodal
        isOpen={isModalOpen}
        onClose={closeModal}
        handleAddSem={handleAddSem}
      />
    </>
  );
}

export default ViewSems;
