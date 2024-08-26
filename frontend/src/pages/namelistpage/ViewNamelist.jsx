import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import del from "../../assets/delete.svg";
import edit from "../../assets/edit.svg";
import Navbar from "../../components/Navbar";
import AddStudentModal from "./AddStudent.modal";
import EditNamelistModal from "./EditNamelist.Modal";

const ViewNamelist = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { namelistId } = useParams();
  const { bundleId } = useParams();

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

  const handleEditClick = (student) => {
    setEditStudentData(student);
    setIsEditModalOpen(true);
  };

  const handledelete = async (student) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/namelist/student/${user.userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            namelistId: namelistId,
            studentId: student._id,
          }),
        }
      );
      const data = await response.json();
    } catch (error) {
      console.log("An error occured while deleting");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/namelist/student/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            namelistId: namelistId,
            bundleId: bundleId,
            studentDetail: {
              name: studentName,
              rollno: rollNo,
              registration_no: regno,
            },
          }),
        }
      );
      if (response.ok) {
        setStudentName("");
        setRollNo("");
        setRegNo("");
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
        `${
          import.meta.env.VITE_API
        }/namelist/student/${bundleId}/${namelistId}/${user.userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setNamelist(data);
      // console.log(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching namelist", error);
      setError("Failed to fetch student data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [namelistId]);

  return (
    <>
      <Navbar />
      <div className="flex justify-end p-2 font-primary">
        <button
          className="bg-green-600 text-xl p-2 w-fit text-white border-2 border-none rounded-md mt-4"
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
        namelistId={namelistId}
        fetchStudent={fetchStudent}
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
                <th className="w-auto py-2">Registeration No</th>
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
