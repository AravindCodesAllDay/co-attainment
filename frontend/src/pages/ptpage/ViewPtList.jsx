import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Editptmark from "./EditPtMarks.modal";
import edit from "../../assets/edit.svg";

export default function ViewPtList() {
  const { ptlistid } = useParams();
  const [ptlist, setPtlist] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/pt/ptlist/${ptlistid}/${user.userId}`
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 overflow-x-auto ">
        <h1 className="text-2xl font-bold mb-4">Student List</h1>
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
              {ptlist &&
                ptlist.structure.map((part, index) => (
                  <th
                    key={index}
                    colSpan={part.questions.length}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {part.title}
                  </th>
                ))}
            </tr>
            <tr>
              {ptlist &&
                ptlist.structure.map((part, index) =>
                  part.questions.map((question, qIndex) => (
                    <th
                      key={qIndex}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {question.number}({question.option})
                    </th>
                  ))
                )}
            </tr>
          </thead>
          <tbody>
            {ptlist &&
              ptlist.students.map((student) => (
                <tr className="justify-center" key={student.id}>
                  <td className="border  border-gray-300 px-4 py-2 cursor-pointer">
                    <img src={edit} onClick={() => handleEditClick(student)} />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-bold">
                    {student.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-bold">
                    {student.rollno}
                  </td>
                  {student.parts.map((part, pIndex) =>
                    part.questions.map((question, qIndex) => (
                      <td
                        key={qIndex}
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
      </div>
      {isModalOpen && (
        <Editptmark
          student={selectedStudent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
