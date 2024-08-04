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
  const [namelist, setNamelists] = useState([]);

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

  useEffect(() => {
    const fetchNamelists = async () => {
      if (user && user.userId) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API}/namelist/${bundleId}/${user.userId}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setNamelists(data);
          // console.log(data);
        } catch (error) {
          console.log("Error while fetching:", error);
        }
      } else {
        console.log("User not found in localStorage");
      }
    };

    fetchNamelists();
  }, []);

  const handleClick = (bundleId, semesterId) => {
    if (namelist.length > 0) {
      // Assuming you need to navigate with the first namelistId for demonstration
      const selectedNamelistId = namelist[0].namelistId;
      navigate(
        `/courses/${bundleId}/${semesterId}/${selectedNamelistId}/${user.userId}`
      );
    } else {
      console.log("No namelist available");
    }
  };

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
            onClick={() => handleClick(bundleId, sem.semesterId)}
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
