import React, { useState } from "react";
import close from "../../assets/close.svg";

const AddStudentModal = ({ onRequestClose, error, fetchStudent }) => {
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [regno, setRegNo] = useState("");

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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md mx-auto">
        <button
          onClick={onRequestClose}
          className="absolute top-2 right-2 text-gray-700"
        >
          <img className="cursor-pointer" src={close} />
        </button>
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <p className="mb-4 font-semibold text-lg">Add Student</p>
          <div className="mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Student Name:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter student name"
            />
          </div>
          <div className="mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Roll No:
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter roll number"
            />
          </div>
          <div className="mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Registeration No
            </label>
            <input
              type="text"
              value={regno}
              onChange={(e) => setRegNo(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter RegNo number"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
          {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
