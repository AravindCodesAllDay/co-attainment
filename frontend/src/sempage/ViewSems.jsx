import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Addsemmodal from "./AddsemModal";

function ViewSems() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sems, setSems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddSem = (newSem) => {
    setSems((prevSems) => [...prevSems, newSem]);
  };

  const fetchSems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/semester/${batchId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch semesters.");
      }

      const data = await response.json();
      setSems(data);
    } catch (error) {
      console.error("Error fetching Semester:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSems();
  }, []);

  return (
    <>
      <div className="flex justify-between p-2 px-4 font-primary">
        <h2 className="font-bold text-2xl text-blue-600 mb-6">Semester</h2>
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-none rounded-md mt-4"
          onClick={openModal}
        >
          Add Sem
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-500 text-lg mt-4">Loading...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-500 text-lg mt-4">{error}</div>
      )}

      {/* Empty State */}
      {!loading && sems.length === 0 && !error && (
        <div className="text-center text-gray-500 text-lg mt-4">
          No semesters found.
        </div>
      )}

      {/* Semester Grid */}
      {!loading && sems.length > 0 && (
        <div className="grid grid-cols-4 gap-4 p-4">
          {sems.map((sem, index) => (
            <div
              key={index}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() => navigate(`/namelist/${batchId}/${sem.semesterId}`)}
            >
              {sem.title}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Adding Semester */}
      <Addsemmodal
        isOpen={isModalOpen}
        onClose={closeModal}
        handleAddSem={handleAddSem}
      />
    </>
  );
}

export default ViewSems;
