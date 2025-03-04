import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

import EditCoMarksModal from "./EditCoMarksModal";
import edit from "../../assets/edit.svg";

export default function ViewCourse() {
  const { batchId, courseId, semesterId } = useParams();

  const [courselist, setCourselist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API
        }/course/${batchId}/${semesterId}/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      const data = await response.json();
      setCourselist(data);
    } catch (error) {
      console.log("Error while fetching:", error);
    }
  };

  const handleEditClick = (student) => {
    setCurrentRow(student);
    setShowModal(true);
  };

  const handleModalClose = () => {
    fetchCourse()
    setShowModal(false);
    setCurrentRow(null);
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleDownloadExcel = () => {
    if (!courselist) return;
  
    const headers = ["Student Name", "Roll No", ...Object.keys(courselist.structure), "Average"];
  
    const data = courselist.students.map((student) => [
      student.name,
      student.rollno,
      ...Object.keys(courselist.structure).map((key) => student.scores[key] ?? "N/A"),
      student.average,
    ]);
  
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
    XLSX.writeFile(workbook, `${courselist.title || "Course"}_Marks.xlsx`);
  };
  
  return (
    <>
      <div className="container mx-auto px-4">
      <div className="flex justify-between items-center gap-4 p-2 px-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {courselist ? courselist.title : "Student Course List"}
        </h1>
          <button
            className="bg-gray-600 text-xl p-2 text-white rounded-md cursor-pointer"
            onClick={handleDownloadExcel}
          >
            Download Excel
          </button>
        </div>
        <div className="overflow-auto">
          {courselist ? (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 text-left font-medium">
                    Student Name
                  </th>
                  <th className="py-2 px-4 text-left font-medium">Roll No</th>
                  {Object.keys(courselist.structure).map((key, index) => (
                    <th key={index} className="py-2 px-4 text-left font-medium">
                      {key}({courselist.structure[key]})
                    </th>
                  ))}

                  <th className="py-2 px-4 text-left font-medium">Average</th>
                  <th className="py-2 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courselist.students.map((student, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4">{student.rollno}</td>
                    {Object.keys(courselist.structure).map((key, index) => (
                      <td key={index} className="py-2 px-4">
                        {student.scores[key]}
                      </td>
                    ))}
                    <td className="py-2 px-4">{student.average}</td>
                    <td className="py-2 px-4 flex flex-row gap-4 items-center">
                      <img
                        className="cursor-pointer"
                        src={edit}
                        alt="Edit"
                        onClick={() => handleEditClick(student)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      {showModal && (
        <EditCoMarksModal
          student={currentRow}
          structure={courselist.structure}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
