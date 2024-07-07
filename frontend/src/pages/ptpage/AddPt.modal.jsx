import React, { useState, useEffect } from "react";

export default function Modal({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [titles, setTitles] = useState([]);
  const [namelist_id, setNamelistId] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [mainMark, setMainMark] = useState("");
  const [rows, setRows] = useState([
    {
      title: "",
      maxMark: "",
      questions: [{ number: 1, option: "understand" }],
    },
  ]);
  const [globalQuestionCounter, setGlobalQuestionCounter] = useState(1);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        title: "",
        maxMark: "",
        questions: [
          { number: globalQuestionCounter + 1, option: "understand" },
        ],
      },
    ]);
    setGlobalQuestionCounter(globalQuestionCounter + 1);
  };

  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleAddQuestion = (rowIndex) => {
    const newQuestionNumber = globalQuestionCounter + 1;
    const newRows = rows.map((row, i) =>
      i === rowIndex
        ? {
            ...row,
            questions: [
              ...row.questions,
              { number: newQuestionNumber, option: "understand" },
            ],
          }
        : row
    );
    setRows(newRows);
    setGlobalQuestionCounter(newQuestionNumber);
  };

  const handleDeleteQuestion = (rowIndex, questionIndex) => {
    const newRows = rows.map((row, i) =>
      i === rowIndex
        ? {
            ...row,
            questions: row.questions.filter((_, j) => j !== questionIndex),
          }
        : row
    );
    setRows(newRows);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(newRows);
  };

  const handleQuestionChange = (rowIndex, questionIndex, field, value) => {
    const newRows = rows.map((row, i) =>
      i === rowIndex
        ? {
            ...row,
            questions: row.questions.map((question, j) =>
              j === questionIndex ? { ...question, [field]: value } : question
            ),
          }
        : row
    );
    setRows(newRows);
  };

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API}/student/namelists/${user.userId}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTitles(data);
      } catch (error) {
        console.error("Error occurred while fetching:", error);
      }
    };

    if (user && user.userId) {
      fetchTitles();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt/create/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nameListId: namelist_id,
            title: mainTitle,
            parts: rows,
            maxMark: mainMark,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("PtList created:", result);
      onClose();
    } catch (error) {
      console.error("Error creating PtList:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-4 rounded-md w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Add PtList</h2>
          <button className="text-red-600" onClick={onClose}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title Name
            </label>
            <input
              type="text"
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Total Mark
            </label>
            <input
              type="number"
              value={mainMark}
              onChange={(e) => setMainMark(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Namelist
            </label>
            <select
              name="namelist"
              value={namelist_id || ""}
              onChange={(e) => setNamelistId(e.target.value)}
              className="border border-gray-300 p-2 mb-2 rounded-lg w-full"
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
          </div>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-4">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Title"
                  className="mt-1 block p-2 border border-gray-300 rounded-md w-1/2"
                  value={row.title}
                  onChange={(e) =>
                    handleRowChange(rowIndex, "title", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Max Mark"
                  className="mt-1 block p-2 border border-gray-300 rounded-md w-1/2"
                  value={row.maxMark}
                  onChange={(e) =>
                    handleRowChange(rowIndex, "maxMark", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="text-red-900"
                  onClick={() => handleDeleteRow(rowIndex)}
                >
                  X
                </button>
              </div>
              <button
                type="button"
                className="bg-blue-600 text-white p-2 rounded-md mb-2"
                onClick={() => handleAddQuestion(rowIndex)}
              >
                Add Question
              </button>
              {row.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="flex space-x-2 mb-2">
                  <input
                    type="number"
                    placeholder="Question Number"
                    className="mt-1 block p-2 border border-gray-300 rounded-md w-1/4"
                    value={question.number}
                    onChange={(e) =>
                      handleQuestionChange(
                        rowIndex,
                        questionIndex,
                        "number",
                        e.target.value
                      )
                    }
                  />
                  <select
                    className="mt-1 block p-2 border border-gray-300 rounded-md w-1/4"
                    value={question.option}
                    onChange={(e) =>
                      handleQuestionChange(
                        rowIndex,
                        questionIndex,
                        "option",
                        e.target.value
                      )
                    }
                  >
                    <option value="understand">Understand</option>
                    <option value="apply">Apply</option>
                    <option value="analyse">Analyse</option>
                  </select>
                  <button
                    type="button"
                    className="text-red-900"
                    onClick={() =>
                      handleDeleteQuestion(rowIndex, questionIndex)
                    }
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            className="bg-green-600 text-white p-2 rounded-md mb-2"
            onClick={handleAddRow}
          >
            Add Row
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white p-2 rounded-md ml-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
