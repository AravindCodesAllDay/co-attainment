import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function SelectCoatt() {
  const [selectOptions, setSelectOptions] = useState([]);
  const [selects, setSelects] = useState([]);
  const [selectcourse, setselectcourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdowns, setDropdowns] = useState([{ id: 0, type: "course" }]);
  const { batchId, semesterId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const responses = await Promise.all([
          fetch(`${import.meta.env.VITE_API}/pt/${batchId}/${semesterId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }),
          fetch(`${import.meta.env.VITE_API}/course/${batchId}/${semesterId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }),
          fetch(`${import.meta.env.VITE_API}/see/${batchId}/${semesterId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }),
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
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [batchId, semesterId]);

  const handleDropdownTypeChange = (id, value) => {
    setDropdowns(
      dropdowns.map((dropdown) =>
        dropdown.id === id ? { ...dropdown, type: value } : dropdown
      )
    );
  };

  const addDropdown = () =>
    setDropdowns([...dropdowns, { id: dropdowns.length, type: "course" }]);
  const removeDropdown = (id) =>
    setDropdowns(dropdowns.filter((dropdown) => dropdown.id !== id));

  return (
    <div className="flex justify-center items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-2xl p-6 shadow-xl bg-white rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select Options</h2>
          <button
            onClick={addDropdown}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            Add +
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : (
          <div className="space-y-4">
            {dropdowns.map((dropdown) => (
              <div key={dropdown.id} className="flex items-center gap-4">
                <select
                  value={dropdown.type}
                  onChange={(e) =>
                    handleDropdownTypeChange(dropdown.id, e.target.value)
                  }
                  className="w-32 p-2 border rounded-md"
                >
                  <option value="course">Course</option>
                  <option value="pt">Pt</option>
                  <option value="see">See</option>
                </select>
                <select className="flex-1 p-2 border rounded-md">
                  {dropdown.type === "course" &&
                    selects.map((option) => (
                      <option key={option.courseId} value={option.courseId}>
                        {option.title}
                      </option>
                    ))}
                  {dropdown.type === "pt" &&
                    selectcourse.map((option) => (
                      <option key={option.ptId} value={option.ptId}>
                        {option.title}
                      </option>
                    ))}
                  {dropdown.type === "see" &&
                    selectOptions.map((option) => (
                      <option key={option.seeId} value={option.seeId}>
                        {option.title}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => removeDropdown(dropdown.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <button className="w-full mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">
          Submit
        </button>
      </div>
    </div>
  );
}

export default SelectCoatt;
