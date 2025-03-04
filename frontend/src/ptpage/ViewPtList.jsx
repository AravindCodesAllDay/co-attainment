import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

import Editptmark from "./EditPtMarksModal";
import edit from "../../assets/edit.svg";

export default function ViewPtList() {
  const { ptId, batchId, semesterId } = useParams();

  const [ptlist, setPtlist] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt/${batchId}/${semesterId}/${ptId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPtlist(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleDownloadExcel = () => {
    if (!ptlist) return;

    const headers = ["Student Name", "Roll No", "Mark"];
    ptlist.structure.forEach((part) => {
      part.questions.forEach((question) => {
        headers.push(
          `${part.title} - Q${question.number} (${question.option})`
        );
      });
    });

    const data = ptlist.students.map((student) => {
      const row = [student.name, student.rollno, student.totalMark];

      student.parts.forEach((part, pIndex) => {
        part.questions.forEach((question) => {
          row.push(question.mark);
        });
      });

      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student PT List");
    XLSX.writeFile(workbook, `${ptlist.title || "Pt"}_Marks.xlsx`);
  };

  return (
    <>
      <div className=" mx-auto p-4 overflow-x-auto ">
        <div className="flex justify-between items-center gap-4 p-2 px-4">
          <h1 className="text-2xl font-bold">{ptlist ? ptlist.title : "PT"}</h1>
          <button
            className="bg-gray-600 text-xl p-2 text-white rounded-md cursor-pointer"
            onClick={handleDownloadExcel}
          >
            Download Excel
          </button>
        </div>
        <div className="overflow-auto">
        {ptlist ? (
          <table className="justify-center items-center table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                  Actions
                </th>
                <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                  Student Name
                </th>
                <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                  Roll No
                </th>
                <th rowSpan="2" className="border border-gray-300 px-4 py-2">
                  Mark
                </th>
                {ptlist.structure.map((part) => (
                  <th
                    key={part.title}
                    colSpan={part.questions.length}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {part.title}-({part.maxMark})
                  </th>
                ))}
              </tr>
              <tr>
                {ptlist.structure.flatMap((part) =>
                  part.questions.map((question) => (
                    <th
                      key={question._id}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {question.number}({question.option})
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {ptlist.students.map((student) => (
                <tr className="justify-center" key={student.rollno}>
                  <td className="border border-gray-300 px-4 py-2 cursor-pointer">
                    <img
                      src={edit}
                      onClick={() => handleEditClick(student)}
                      alt="Edit"
                      className="mx-auto"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-bold">
                    {student.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-bold text-center">
                    {student.rollno}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-bold text-center">
                    {student.totalMark}
                  </td>
                  {student.parts.map((part, pIndex) =>
                    part.questions.map((question, qIndex) => (
                      <td
                        key={`${pIndex}-${qIndex}`}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {question.mark}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
        </div>
      </div>
      {isModalOpen && (
        <Editptmark
          student={selectedStudent}
          onClose={() => setIsModalOpen(false)}
          fetchStudent={fetchStudent}
        />
      )}
    </>
  );
}
