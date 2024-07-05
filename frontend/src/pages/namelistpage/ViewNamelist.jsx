import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import AddStudentModal from "./AddStudent.modal";

const ViewNamelist = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { namelistid } = useParams();

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [namelist, setNamelist] = useState({ title: "", students: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/student/addstudent/${user.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            namelistId: namelistid,
            rollno: rollNo,
            name: studentName,
          }),
        }
      );
      if (response.ok) {
        setStudentName("");
        setRollNo("");
        fetchStudent(); // Refresh the student list
        setIsModalOpen(false); // Close modal on success
        setError(""); // Clear any previous error
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

  const fetchStudent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/student/students/${namelistid}/${
          user.userId
        }`
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
  }, [namelistid]);

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-48 text-white border-2 border-none rounded-md mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          Add Student
        </button>
      </div>
      <AddStudentModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        studentName={studentName}
        setStudentName={setStudentName}
        rollNo={rollNo}
        setRollNo={setRollNo}
        handleSubmit={handleSubmit}
        error={error}
        title={namelist.title}
      />
      <div className="flex justify-center flex-col p-4">
        <h2 className="font-bold text-2xl text-blue-600 mb-6">
          {namelist.title}
        </h2>
        {isLoading ? (
          <div className="flex justify-center mt-4">Loading...</div>
        ) : error ? (
          <div className="flex justify-center mt-4">{error}</div>
        ) : namelist.students.length === 0 ? (
          <div className="flex justify-center mt-4">
            No students data available
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="w-auto py-2">Student Name</th>
                <th className="w-auto py-2">Roll No</th>
                <th className="w-40 py-2  text-left text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {namelist.students.map((student, index) => (
                <tr key={index} className="bg-gray-100">
                  <td className="border px-4 py-2">{student.name}</td>
                  <td className="border px-4 py-2">{student.rollno}</td>
                  <td className="py-2 px-4 flex flex-row gap-4 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-pencil-plus"
                      className="cursor-pointer"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="#00b341"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                      <path d="M13.5 6.5l4 4" />
                      <path d="M16 19h6" />
                      <path d="M19 16v6" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-trash"
                      className="cursor-pointer"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="#ff2825"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 7l16 0" />
                      <path d="M10 11l0 6" />
                      <path d="M14 11l0 6" />
                      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                    </svg>
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
