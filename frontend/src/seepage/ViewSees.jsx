import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddSeeModal from "./AddSeeModal";

function ViewSees() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { batchId, semesterId } = useParams();
  const [sees, setSees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchSees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/see/${batchId}/${semesterId}`,
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
      setSees(data);
    } catch (error) {
      console.error("Failed to fetch sees:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSees();
  }, []);

  return (
    <>
      <div className="flex flex-row justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
          onClick={handleOpenModal}
        >
          Add See
        </button>
      </div>
      {isModalOpen && (
        <AddSeeModal handleClose={handleCloseModal} fetchSees={fetchSees} />
      )}

      <div className="grid grid-cols-4 gap-4 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center mt-4 text-2xl">
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center col-span-4">{error}</div>
        ) : sees.length === 0 ? (
          <div className="text-gray-500 text-center col-span-4">
            No sees available.
          </div>
        ) : (
          sees.map((pt) => (
            <div
              key={pt.seeId}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(`/see/${pt.seeId}`)}
            >
              {pt.title}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default ViewSees;
