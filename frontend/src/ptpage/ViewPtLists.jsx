import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddPtModal from "./AddPtModal";

export default function ViewPtLists() {
  const navigate = useNavigate();
  const { batchId, semesterId } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pts, setPts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt/${batchId}/${semesterId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch PT lists");
      }
      const data = await response.json();
      setPts(data);
    } catch (error) {
      console.error("Failed to fetch PT lists:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPts();
  }, []);

  return (
    <>
      <div className="flex justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          Add PtList
        </button>
      </div>
      <AddPtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fetchPts={fetchPts}
      />

      <div className="grid grid-cols-4 gap-4 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center mt-4 text-2xl">
            Loading...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center mt-4 text-red-500 text-2xl">
            {error}
          </div>
        ) : pts.length === 0 ? (
          <div className="flex justify-center items-center mt-4 text-2xl">
            No PT lists available.
          </div>
        ) : (
          pts.map((pt) => (
            <div
              key={pt.ptId}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() =>
                navigate(`/ptlists/${batchId}/${semesterId}/${pt.ptId}`)
              }
            >
              {pt.title}
            </div>
          ))
        )}
      </div>
    </>
  );
}
