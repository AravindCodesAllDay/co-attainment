import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import edit from "../../assets/edit.svg";
import del from "../../assets/delete.svg";
import EditCoMarksModal from "../coursepage/EditCoMarks.Modal";

export default function ViewCourse() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { bundleId, courseId, semesterId } = useParams();

  const [courselist, setCourselist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);

  const fetchCourse = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API
        }/course/${bundleId}/${semesterId}/${courseId}/${user.userId}`
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
    setShowModal(false);
    setCurrentRow(null);
  };

  const handleModalSubmit = async (updatedData) => {
    try {
      // Prepare the payload
      const payload = {
        scores: updatedData.scores,
        coId: courseId,
        bundleId: bundleId,
        semId: semesterId,
        stdId: currentRow._id,
      };

      // Send the update request to the backend
      const response = await fetch(
        `${import.meta.env.VITE_API}/score/${user.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update scores");
      }

      const updatedCourselist = await response.json();

      // Update the local state
      setCourselist(updatedCourselist);
      handleModalClose();
    } catch (error) {
      console.error("Error while updating scores:", error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-800 my-4">
          {courselist ? courselist.title : "Title"}
        </h2>
        <div className="overflow-x-auto">
          {courselist ? (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 text-left font-medium">
                    Student Name
                  </th>
                  <th className="py-2 px-4 text-left font-medium">Roll No</th>
                  {courselist.rows.map((row, index) => (
                    <th key={index} className="py-2 px-4 text-left font-medium">
                      {row}
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
                    {courselist.rows.map((row, index) => (
                      <td key={index} className="py-2 px-4">
                        {student.scores[row]}
                      </td>
                    ))}
                    <td className="py-2 px-4">{student.averageScore}</td>
                    <td className="py-2 px-4 flex flex-row gap-4 items-center">
                      <img
                        className="cursor-pointer"
                        src={edit}
                        alt="Edit"
                        onClick={() => handleEditClick(student)}
                      />
                      <img className="cursor-pointer" src={del} alt="Delete" />
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
          rows={courselist.rows}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}
