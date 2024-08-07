import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import AddPtModal from "./AddPt.modal";
import { useNavigate, useParams } from "react-router-dom";

export default function ViewPtLists() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const { bundleId, semesterId } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pts, setPts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPts = async () => {
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
      setPts(data);
      // console.log(data);
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
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          Add PtList
        </button>
      </div>
      <AddPtModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid grid-cols-4 gap-4 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center mt-4 text-2xl">
            Loading...
          </div>
        ) : (
          pts.map((pt) => (
            <div
              key={pt._id}
              className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-2xl cursor-pointer"
              onClick={() =>
                navigate(`/ptlists/${bundleId}/${semesterId}/${pt.ptId}`)
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
