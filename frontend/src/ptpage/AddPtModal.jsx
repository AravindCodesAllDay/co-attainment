import React, { useState,useEffect } from "react";
import close from "../../assets/close.svg";
import { useParams } from "react-router-dom";

export default function Modal({ isOpen, onClose, fetchPts }) {
  const { batchId, semesterId } = useParams();
  const [mainTitle, setMainTitle] = useState("");
  const [mainMark, setMainMark] = useState(0);
  const [cotypes, setCotypes] = useState([]);
  const [rows, setRows] = useState([
    {
      title: "Part 1",
      maxMark: "",
      questions: [{ number: 1, option: "" }],
    },
  ]);

  const handleAddRow = () => {
    const newPartNumber = rows.length + 1;
    setRows([
      ...rows,
      {
        title: `Part ${newPartNumber}`,
        maxMark: "",
        questions: [{ number: 1, option: "" }],
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows
      .filter((_, i) => i !== index)
      .map((row, i) => ({
        ...row,
        title: `Part ${i + 1}`,
      }));
    setRows(newRows);
  };

  const handleAddQuestion = (rowIndex) => {
    const newRows = rows.map((row, i) => {
      if (i === rowIndex) {
        const newQuestions = [
          ...row.questions,
          { number: row.questions.length + 1, option: "" },
        ];
        return { ...row, questions: newQuestions };
      }
      return row;
    });
    const totalMark = newRows.reduce(
      (sum, part) => sum + (Number(part.maxMark) || 0) * part.questions.length,
      0
    );
    setMainMark(totalMark);
    setRows(newRows);
  };

  const handleDeleteQuestion = (rowIndex, questionIndex) => {
    const newRows = rows.map((row, i) => {
      if (i === rowIndex) {
        const newQuestions = row.questions
          .filter((_, j) => j !== questionIndex)
          .map((question, j) => ({ ...question, number: j + 1 }));
        return { ...row, questions: newQuestions };
      }
      return row;
    });
    const totalMark = newRows.reduce(
      (sum, part) => sum + (Number(part.maxMark) || 0) * part.questions.length,
      0
    );
    setMainMark(totalMark);
    setRows(newRows);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    const totalMark = newRows.reduce(
      (sum, part) => sum + (Number(part.maxMark) || 0) * part.questions.length,
      0
    );
    setMainMark(totalMark);
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
    fetchCotypes();
  }, []);

  const fetchCotypes = async () => {
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
    } catch (error) {
      console.error("Error fetching cotypes:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            title: mainTitle,
            structure: rows.map((row) => ({
              ...row,
              maxMark: Number(row.maxMark),
            })),
            batchId,
            semId: semesterId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      fetchPts();
      onClose();
    } catch (error) {
      console.error("Error creating PtList:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-4 rounded-md w-1/2 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Add PtList</h2>
          <button className="text-red-600" onClick={onClose}>
            <img src={close} alt="" />
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
              type="Number"
              value={mainMark}
              disabled
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-4">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Title"
                  className="mt-1 block p-2 border border-gray-300 rounded-md w-1/2"
                  value={row.title}
                  disabled
                />
                <input
                  type="Number"
                  placeholder="Max Mark"
                  className="mt-1 block p-2 border border-gray-300 rounded-md w-1/2"
                  value={row.maxMark}
                  onChange={(e) =>
                    handleRowChange(rowIndex, "maxMark", e.target.value)
                  }
                />
                <img
                  className="text-red-900"
                  onClick={() => handleDeleteRow(rowIndex)}
                  src={close}
                />
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
                    disabled
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
                  <option value="">Select type</option>
                    {cotypes.map((cotype,index) => (
                      <option key={`${questionIndex}${index}`} value={cotype}>
                        {cotype}
                      </option>
                    ))}
                  </select>
                  <img
                    className="text-red-900"
                    onClick={() =>
                      handleDeleteQuestion(rowIndex, questionIndex)
                    }
                    src={close}
                  />
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
