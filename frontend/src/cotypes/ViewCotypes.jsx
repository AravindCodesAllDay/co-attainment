import React, { useEffect, useState } from "react";
import del from "../../assets/delete.svg";
import AddCotype from "./AddCotype.modal";

const ViewCotypes = () => {
  const [cotypes, setCotypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCotypes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/cotype`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCotypes(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cotypes", error);
      setError("Failed to fetch cotypes");
      setIsLoading(false);
    }
  };

  const deleteCotype = async (cotype) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/cotype`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ cotype }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete cotype");
      }
      fetchCotypes();
    } catch (error) {
      console.error("Error deleting cotype", error);
      setError("Failed to delete cotype");
    }
  };

  useEffect(() => {
    fetchCotypes();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center p-2 px-4 font-primary">
        <h2 className="font-bold text-2xl text-blue-600 mb-6">Cotype</h2>
        <button
          className="bg-green-600 text-xl p-2 text-white rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Add Cotype
        </button>
      </div>

      <AddCotype
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        fetchCotypes={fetchCotypes}
      />

      <div className="flex justify-center flex-col p-4">
        {isLoading ? (
          <div className="flex justify-center mt-4">Loading...</div>
        ) : error ? (
          <div className="flex justify-center mt-4">{error}</div>
        ) : cotypes.length === 0 ? (
          <div className="flex justify-center mt-4">No cotypes available</div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="w-auto py-2">Cotype</th>
                <th className="w-auto py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cotypes.map((cotype, index) => (
                <tr key={index} className="bg-gray-100">
                  <td className="border px-4 py-2">{cotype}</td>
                  <td className="border px-4 py-2">
                    <img
                      className="cursor-pointer"
                      src={del}
                      onClick={() => deleteCotype(cotype)}
                      alt="Delete"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ViewCotypes;
