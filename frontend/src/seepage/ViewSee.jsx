import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

import edit from "../../assets/edit.svg";
import AddSeeModal from "./AddSeeModal";
import EditSeeMarkModal from "./EditSeeMarkModal";

export default function ViewSee() {
  const { batchId, semesterId } = useParams();
  const [seelist, setSeelist] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headers, setHeaders] = useState([]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/see/${batchId}/${semesterId}`,
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
      setSeelist(data);

      if (data.length > 0) {
        const allCourses = new Set();
        data.forEach((student) => {
          if (student.scores) {
            Object.keys(student.scores).forEach((course) => {
              allCourses.add(course);
            });
          }
        });
        setHeaders([...allCourses]);
      }
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
    setIsEditModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDownloadExcel = () => {
    if (!seelist || seelist.length === 0) return;
  
    const excelHeaders = ["Student Name", "Roll No", ...headers];
  
    const data = seelist.map((student) => [
      student.name,
      student.rollno,
      ...headers.map((course) => student.scores?.[course] ?? "0"),
    ]);
  
    const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SEE Marks");
  
    XLSX.writeFile(workbook, `SEE_Marks_${batchId}_Sem${semesterId}.xlsx`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between p-2 font-primary">
        <h1 className="text-2xl font-bold">Student List</h1>
        <div className="flex gap-3">
        <button
            className="bg-gray-600 text-xl p-2 text-white rounded-md cursor-pointer"
            onClick={handleDownloadExcel}
          >
            Download Excel
          </button>
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md"
          onClick={() => setIsAddModalOpen(true)}
        >
          Change Header
        </button></div>
      </div>
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-300 px-4 py-2">Edit</th>
            <th className="border border-gray-300 px-4 py-2">Student Name</th>
            <th className="border border-gray-300 px-4 py-2">Roll No</th>
            {headers.map((course, index) => (
              <th key={index} className="border border-gray-300 px-4 py-2">
                {course}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {seelist &&
            seelist.map((student, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <img
                    src={edit}
                    onClick={() => handleEditClick(student)}
                    alt="Edit"
                    className="cursor-pointer mx-auto"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 font-bold">
                  {student.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-bold">
                  {student.rollno}
                </td>
                {headers.map((course, index) => (
                  <td
                    key={index}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    {student.scores && student.scores[course] !== undefined
                      ? student.scores[course]
                      : "0"}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {isAddModalOpen && (
        <AddSeeModal
          onClose={() => setIsAddModalOpen(false)}
          fetchStudent={fetchStudent}
        />
      )}

      {isEditModalOpen && selectedStudent && (
        <EditSeeMarkModal
          student={selectedStudent}
          onClose={() => setIsEditModalOpen(false)}
          fetchStudent={fetchStudent}
        />
      )}
    </div>
  );
}
