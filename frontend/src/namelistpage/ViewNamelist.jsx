import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

import del from "../../assets/delete.svg";
import edit from "../../assets/edit.svg";
import infoIcon from "../../assets/info.svg";
import AddStudentModal from "./AddStudentModal";
import EditNamelistModal from "./EditNamelistModal";

const ViewNamelist = () => {
  const { batchId, semesterId } = useParams();
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [regno, setRegNo] = useState("");
  const [namelist, setNamelist] = useState({ title: "", students: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState({
    name: "",
    rollno: "",
  });
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleEditClick = (student) => {
    setEditStudentData(student);
    setIsEditModalOpen(true);
  };

  const handledelete = async (student) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/namelist`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          batchId,
          semId: semesterId,
          studentId: student._id,
        }),
      });
      if (!response.ok) {
      }
      fetchStudent();
    } catch (error) {
      console.log("An error occured while deleting");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API}/namelist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          batchId,
          semId: semesterId,
          studentDetails: [
            {
              name: studentName,
              rollno: rollNo,
              registration_no: regno,
            },
          ],
        }),
      });
      if (response.ok) {
        setStudentName("");
        setRollNo("");
        setRegNo("");
        fetchStudent();
        setIsModalOpen(false);
        setError("");
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "An error occurred while submitting the namelist"
        );
      }
    } catch (error) {
      setError("An error occurred while submitting the namelist");
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      try {
        const token = localStorage.getItem("token");
        await fetch(`${import.meta.env.VITE_API}/namelist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            batchId,
            semId: semesterId,
            studentDetails: jsonData,
          }),
        });
        fetchStudent();
      } catch (error) {
        console.error("Error uploading students", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchStudent = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API}/namelist/${batchId}/${semesterId}`,
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
      setNamelist(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching namelist", error);
      setError("Failed to fetch student data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center p-2 px-4 font-primary">
        <h2 className="font-bold text-2xl text-blue-600 mb-6">
          Namelist {">"} {namelist.title}
        </h2>
        <div className="flex gap-4">
          <button
            className="bg-green-600 text-xl p-2 text-white rounded-md"
            onClick={() => setIsModalOpen(true)}
          >
            Add Student
          </button>
          <label className="bg-blue-600 text-xl p-2 text-white rounded-md cursor-pointer">
            Add from Excel
            <input
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
            />
          </label>
          <img
            src={infoIcon}
            className="cursor-pointer w-6"
            onClick={() => setIsInfoVisible(!isInfoVisible)}
          />
        </div>
      </div>
      {isInfoVisible && (
        <div className="p-4 bg-gray-100 border rounded-md mb-4">
          <p>Excel file should have the following headers:</p>
          <ul className="list-disc pl-5">
            <li>
              <b>name</b>: Student Name
            </li>
            <li>
              <b>rollno</b>: Roll Number
            </li>
            <li>
              <b>registration_no</b>: Registration Number
            </li>
          </ul>
        </div>
      )}
      <AddStudentModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        studentName={studentName}
        setStudentName={setStudentName}
        rollNo={rollNo}
        setRollNo={setRollNo}
        regno={regno}
        setRegNo={setRegNo}
        handleSubmit={handleSubmit}
        error={error}
        title={namelist.title}
      />
      <EditNamelistModal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        studentData={editStudentData}
        setStudentData={setEditStudentData}
        studentId={editStudentData._id}
        fetchStudent={fetchStudent}
      />
      <div className="flex justify-center flex-col p-4">
        {isLoading ? (
          <div className="flex justify-center mt-4">Loading...</div>
        ) : error ? (
          <div className="flex justify-center mt-4">{error}</div>
        ) : namelist.length === 0 ? (
          <div className="flex justify-center mt-4">
            No students data available
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="w-auto py-2">Student Name</th>
                <th className="w-auto py-2">Roll No</th>
                <th className="w-auto py-2">Registeration No</th>
                <th className="w-40 py-2  text-left text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {namelist.map((student, index) => (
                <tr key={index} className="bg-gray-100">
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{student.rollno}</td>
                  <td className="border px-4 py-2">
                    {student.registration_no}
                  </td>
                  <td className="py-2 px-4 flex flex-row gap-4 items-center">
                    <img
                      className="cursor-pointer"
                      src={edit}
                      onClick={() => handleEditClick(student)}
                    />
                    <img
                      className="cursor-pointer"
                      src={del}
                      onClick={() => handledelete(student)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ViewNamelist;
