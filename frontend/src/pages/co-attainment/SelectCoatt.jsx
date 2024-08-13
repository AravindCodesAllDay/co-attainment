import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";

function SelectCoatt() {
  const [selectOptions, setSelectOptions] = useState([]);
  const [selects, setSelects] = useState([]);
  const [selectcourse, setselectcourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdowns, setDropdowns] = useState([{ id: 0, type: "course" }]);
  const { bundleId, semesterId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API}/pt/${bundleId}/${semesterId}/${
            user.userId
          }`
        ),
        fetch(
          `${import.meta.env.VITE_API}/course/${bundleId}/${semesterId}/${
            user.userId
          }`
        ),
        fetch(
          `${import.meta.env.VITE_API}/see/${bundleId}/${semesterId}/${
            user.userId
          }`
        ),
      ]);

      if (!responses.every((response) => response.ok)) {
        throw new Error("One or more network responses were not ok");
      }

      const [ptData, courseData, seeData] = await Promise.all(
        responses.map((response) => response.json())
      );

      setselectcourse(ptData);
      setSelects(courseData);
      setSelectOptions(seeData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDropdownTypeChange = (id, value) => {
    setDropdowns(
      dropdowns.map((dropdown) =>
        dropdown.id === id ? { ...dropdown, type: value } : dropdown
      )
    );
  };

  const addDropdown = () => {
    setDropdowns([...dropdowns, { id: dropdowns.length, type: "course" }]);
  };

  const removeDropdown = (id) => {
    setDropdowns(dropdowns.filter((dropdown) => dropdown.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mt-2 p-2">
        <div className="flex flex-col gap-5 border-2 border-gray-600 p-2 w-96 items-center rounded-md">
          <button
            onClick={addDropdown}
            className="bg-red-600 text-white text-xl p-2 mt-4 hover:bg-green-500 rounded-full"
          >
            +
          </button>

          {dropdowns.map((dropdown) => (
            <div key={dropdown.id} className="flex flex-col gap-4 mt-4 w-full">
              <select
                value={dropdown.type}
                onChange={(e) =>
                  handleDropdownTypeChange(dropdown.id, e.target.value)
                }
                className="border-2 border-gray-600 p-2 rounded-md w-full"
              >
                <option value="course">Course</option>
                <option value="pt">Pt</option>
                <option value="see">See</option>
              </select>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <select className="border-2 border-gray-600 p-2 rounded-md w-full">
                  {dropdown.type === "course" &&
                    selects.map((option, optionIndex) => (
                      <option key={optionIndex} value={option._id}>
                        {option.title}
                      </option>
                    ))}
                  {dropdown.type === "pt" &&
                    selectcourse.map((option, optionIndex) => (
                      <option key={optionIndex} value={option._id}>
                        {option.title}
                      </option>
                    ))}
                  {dropdown.type === "see" &&
                    selectOptions.map((option, optionIndex) => (
                      <option key={optionIndex} value={option._id}>
                        {option.title}
                      </option>
                    ))}
                </select>
              )}

              <button
                onClick={() => removeDropdown(dropdown.id)}
                className="bg-red-600 text-white p-2 rounded-full mt-2"
              >
                Delete
              </button>
            </div>
          ))}

          <button className="bg-green-600 text-white p-3 rounded-md mt-4">
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default SelectCoatt;
