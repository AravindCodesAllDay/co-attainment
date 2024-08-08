import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AddSaamodal from "./AddSaa.modal"; // Adjust the import path as needed
import { useParams } from "react-router-dom";

function ViewSaas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const { bundleId, semesterId } = useParams();
  const [see, setsees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchsees = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt/${bundleId}/${semesterId}/${
          user.userId
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setsees(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchsees();
  }, [user.userId]);

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

      <div className="grid grid-cols-4 gap-4 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center mt-4 text-2xl">
            Loading...
          </div>
        ) : (
          see.map((pt) => (
            <div
              key={pt._id}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(`/saa/${saa._id}`)}
            >
              {pt.title}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default ViewSaas;
