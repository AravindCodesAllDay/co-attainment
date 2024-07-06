import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddNamelistModal from "./AddNamelist.modal";

const ViewNamelists = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [showModal, setShowModal] = useState(false);
  const [titles, setTitles] = useState([]);

  useEffect(() => {
    const fetchTitles = async () => {
      if (user && user.userId) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API}/student/namelists/${user.userId}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setTitles(data);
        } catch (error) {
          console.log("error while fetching:", error);
        }
      } else {
        console.log("User not found in localStorage");
      }
    };

    fetchTitles();
  }, [user]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-row justify-end   p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
          onClick={toggleModal}
        >
          Add Title
        </button>
      </div>
      <AddNamelistModal showModal={showModal} toggleModal={toggleModal} />
      {titles.length ? (
        <div className="grid grid-cols-4 gap-4 items-center mt-4 p-6">
          {titles.map((title) => (
            <div
              key={title._id}
              className="border p-2 m-2 w-3/4 rounded bg-gray-100 cursor-pointer hover:bg-sky-500 font-bold hover:text-white"
              onClick={() => navigate(`/namelists/${title._id}`)}
            >
              {title.title}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center mt-4 text-2xl">Loading...</div>
      )}
    </>
  );
};

export default ViewNamelists;
