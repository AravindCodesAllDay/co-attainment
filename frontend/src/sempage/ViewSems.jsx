import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Addsemmodal from "./Addsem.modal";
import AddNamelistModal from "../namelistpage/AddNamelist.modal";

function ViewSems() {
  const navigate = useNavigate();
  const { bundleId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sems, setSems] = useState([]);
  // const [namelist, setNamelists] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddSem = (newSem) => {
    setSems([...sems, newSem]);
  };

  const fetchSems = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/semester/${bundleId}/${user.userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSems(data);
    } catch (error) {
      console.error("Error fetching Semester", error);
    }
  };

  useEffect(() => {
    fetchSems();
  }, []);

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
      <div className="grid grid-cols-4 gap-4 p-4 ">
        {sems.map((sem, index) => (
          <div
            key={index}
            className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
            onClick={() => navigate(`/courses/${bundleId}/${sem.semesterId}`)}
          >
            {sem.title}
          </div>
        ))}
      </div>
      <Addsemmodal
        isOpen={isModalOpen}
        onClose={closeModal}
        handleAddSem={handleAddSem}
      />
      <AddNamelistModal
        showModal={isModalOpen}
        toggleModal={closeModal}
        bundleId={bundleId}
      />
    </>
  );
}

export default ViewSems;
