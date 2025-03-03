import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function SelectCoatt() {
  const { batchId, semesterId } = useParams();
  const [selectOptions, setSelectOptions] = useState([]);
  const [selects, setSelects] = useState([]);
  const [selectcourse, setselectcourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdowns, setDropdowns] = useState([
    { id: 0, type: "course", value: "" },
  ]);

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
        ]);

        if (!responses.every((response) => response.ok)) {
          throw new Error("One or more network responses were not ok");
        }

        const [ptData, courseData] = await Promise.all(
          responses.map((response) => response.json())
        );

        setselectcourse(ptData);
        setSelects(courseData);
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
        dropdown.id === id ? { ...dropdown, type: value, value: "" } : dropdown
      )
    );
  };

  const handleSelectionChange = (id, value) => {
    setDropdowns(
      dropdowns.map((dropdown) =>
        dropdown.id === id ? { ...dropdown, value } : dropdown
      )
    );
  };

  const addDropdown = () =>
    setDropdowns([
      ...dropdowns,
      { id: dropdowns.length, type: "course", value: "" },
    ]);

  const removeDropdown = (id) =>
    setDropdowns(dropdowns.filter((dropdown) => dropdown.id !== id));

  async function onSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Collect selected PT and Course IDs
      const selectedPtIds = dropdowns
        .filter((d) => d.type === "pt" && d.value)
        .map((d) => d.value);
      const selectedCourseIds = dropdowns
        .filter((d) => d.type === "course" && d.value)
        .map((d) => d.value);

      console.log("Selected PT IDs:", selectedPtIds);
      console.log("Selected Course IDs:", selectedCourseIds);

      const responses = await Promise.all([
        fetch(
          `${
            import.meta.env.VITE_API
          }/pt/${batchId}/${semesterId}/${selectedPtIds}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        ),
        fetch(
          `${
            import.meta.env.VITE_API
          }/course/${batchId}/${semesterId}/${selectedCourseIds}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        ),
        fetch(`${import.meta.env.VITE_API}/see/${batchId}/${semesterId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }),
      ]);

      console.log(
        "API Responses:",
        await Promise.all(responses.map((res) => res.json()))
      );
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-2xl p-6 shadow-xl bg-white rounded-lg">
        <form onSubmit={onSubmit}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Options</h2>
            <button
              type="button"
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
                  </select>
                  <select
                    value={dropdown.value}
                    onChange={(e) =>
                      handleSelectionChange(dropdown.id, e.target.value)
                    }
                    className="flex-1 p-2 border rounded-md"
                  >
                    <option value="">
                      Select {dropdown.type === "course" ? "Course" : "Pt"}
                    </option>
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
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDropdown(dropdown.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default SelectCoatt;
