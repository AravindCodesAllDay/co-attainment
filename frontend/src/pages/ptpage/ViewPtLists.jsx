import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AddPtModal from "./AddPt.modal";
import { useNavigate } from "react-router-dom";

export default function ViewPtLists() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pts, setPts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt/${user.userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPts(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPts();
  }, [user.userId]);

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-48 text-white border-2 border-none rounded-md mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          Add PtList
        </button>
      </div>
      <AddPtModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid grid-cols-4 gap-4 items-center mt-4 p-6">
        {isLoading ? (
          <div className="flex justify-center items-center mt-4 text-2xl">
            Loading...
          </div>
        ) : (
          pts.map((pt) => (
            <div
              key={pt._id}
              className="border p-2 m-2 w-3/4 rounded bg-gray-100 cursor-pointer hover:bg-sky-500 font-bold hover:text-white"
              onClick={() => navigate(`/ptlists/${pt._id}`)}
            >
              {pt.title}
            </div>
          ))
        )}
      </div>
    </>
  );
}
