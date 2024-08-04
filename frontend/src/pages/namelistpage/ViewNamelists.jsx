import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddNamelistModal from "./AddNamelist.modal";

const ViewNamelists = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [showModal, setShowModal] = useState(false);
  const [namelists, setNamelists] = useState([]);

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
          console.log(data);
        } catch (error) {
          console.log("error while fetching:", error);
        }
      } else {
        console.log("User not found in localStorage");
      }
    };

    fetchNamelists();
  }, [namelists]);

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
      {namelists.length ? (
        <div className="grid grid-cols-4 gap-4 p-4">
          {namelists.map((title, index) => (
            <div
              key={title._id}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() =>
                navigate(`/namelists/${title.namelistId}/${bundleId}`)
              }
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
