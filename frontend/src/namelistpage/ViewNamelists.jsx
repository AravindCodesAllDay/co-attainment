import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddNamelistModal from "./AddNamelistModal";

const ViewNamelists = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [namelists, setNamelists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNamelists = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API}/namelist/${batchId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setNamelists(data);
      } catch (error) {
        console.error("Error while fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNamelists();
  }, [batchId]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center p-2 px-4 w-full font-primary">
        <h2 className="font-bold text-2xl text-blue-600 mb-6">Namelist</h2>
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md cursor-pointer"
          onClick={toggleModal}
        >
          Add Namelist
        </button>
      </div>

      <AddNamelistModal showModal={showModal} toggleModal={toggleModal} />

      {loading ? (
        <div className="flex justify-center mt-4 text-2xl">Loading...</div>
      ) : namelists.length > 0 ? (
        <div className="grid grid-cols-4 gap-4 p-4">
          {namelists.map((namelist) => (
            <div
              key={namelist.namelistId}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() =>
                navigate(`/namelists/${batchId}/${namelist.namelistId}`)
              }
            >
              {namelist.title}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center mt-4 text-2xl">
          No namelists found.
        </div>
      )}
    </>
  );
};

export default ViewNamelists;
