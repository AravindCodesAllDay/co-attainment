import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

function SelectCoatt() {
  const [selectOptions, setSelectOptions] = useState([]);
  const [selects, setSelects] = useState([0]); // Initial state with one select
  const [loading, setLoading] = useState(true); // Loading state
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/course/${user.userId}`
      );
      const response1 = await fetch(
        `${import.meta.env.VITE_API}/pt/${user.userId}`
      );

      if (!response.ok) {
        throw new Error("Network response for courses was not ok");
      }
      if (!response1.ok) {
        throw new Error("Network response for pts was not ok");
      }

      const data = await response.json();
      const data1 = await response1.json();
      setSelectOptions([...data, ...data1]);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false); // Set loading to false on error as well
    }
  };

  useEffect(() => {
    if (user) {
      fetchPts();
    }
  }, [user]);

  const handleCreateButtonClick = () => {
    setSelects([...selects, selects.length]); // Add a new select
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mt-2 p-2">
        <div className="border-2 border-gray-600 p-2 w-96 items-center rounded-md">
          <div className="flex justify-center">
            <button
              onClick={handleCreateButtonClick}
              className="bg-red-600 text-white w-48 text-2xl p-2 mt-4 rounded-md hover:bg-green-500"
            >
              Create
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            selects.map((_, index) => (
              <div key={index} className="mt-4">
                <select className="border-2 border-gray-600 p-2 rounded-md w-full">
                  {selectOptions.map((option, optionIndex) => (
                    <option key={optionIndex} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default SelectCoatt;
