import React, { useState, useEffect } from "react";
import close from "../../assets/close.svg";
import { useParams } from "react-router-dom";

const AddCourseModal = ({ isModalOpen, toggleModal }) => {
  if (!isModalOpen) return null;

  const user = JSON.parse(localStorage.getItem("user"));
  const { bundleId } = useParams();
  const { semesterId } = useParams();
  const { namelistId } = useParams();
  const [title, setTitle] = useState("");
  const [namelist, setNamelist] = useState("");
  const [titles, setTitles] = useState([]);
  const [rows, setRows] = useState([""]);

  const handleAddTableRow = () => {
    setRows([...rows, ""]);
  };

  const handleTableRowChange = (tableRowIndex, event) => {
    const values = [...rows];
    values[tableRowIndex] = event.target.value;
    setRows(values);
  };

  const fetchTitles = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/course/${bundleId}/${semesterId}/${
          user.userId
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTitles(data);
    } catch (error) {
      console.error("Failed to fetch titles:", error);
      setError("Failed to fetch titles.");
    }
  };

  useEffect(() => {
    fetchTitles();
  }, [user.userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/course/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            namelistId: namelistId,
            bundleId: bundleId,
            semId: semesterId,
            rows,
          }),
        }
      );
      if (response.ok) {
        toggleModal();
        fetchCourses(); // Refresh courses after successful submission
      } else {
        console.error("Failed to submit the course.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

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
          setNamelist(data);
          // console.log(data);
        } catch (error) {
          console.log("error while fetching:", error);
        }
      } else {
        console.log("User not found in localStorage");
      }
    };

    fetchNamelists();
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-end">
          <h1 className="mr-auto text-xl text-blue-700 font-bold">Co-List</h1>
          <button
            onClick={toggleModal}
            className=" text-sm p-2 w-fit text-white border-2 border-none rounded-md mb-4 items-end"
          >
            <img className="cursor-pointer" src={close} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter the Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 p-2 mb-2 rounded"
            />
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Namelist
            </label>
            <select
              name="namelist"
              value={namelist}
              onChange={(e) => setNamelist(e.target.value)}
              className="border border-gray-300 p-2 mb-2 rounded-lg"
            >
              <option value="" disabled>
                Select namelist
              </option>
              {titles.map((title, index) => (
                <option key={index} value={title._id}>
                  {title.title}
                </option>
              ))}
            </select>

            {rows.map((tableRow, tableRowIndex) => (
              <input
                key={tableRowIndex}
                type="text"
                placeholder="Table Row Name"
                value={tableRow}
                onChange={(e) => handleTableRowChange(tableRowIndex, e)}
                className="border border-gray-300 p-2 mb-2 rounded-lg"
              />
            ))}
            <button
              type="button"
              onClick={handleAddTableRow}
              className="bg-blue-600 text-sm p-2 w-fit text-white border-2 border-none rounded-md mt-1 mb-4"
            >
              Add Table Row
            </button>
          </div>

          <div className="space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-xl p-2 w-44 text-white border-2 border-none rounded-md mt-4"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
