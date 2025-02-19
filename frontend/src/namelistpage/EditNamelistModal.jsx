import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Modal from "react-modal";
import close from "../../assets/close.svg";

const EditNamelistModal = ({
  isOpen,
  onRequestClose,
  studentData,
  setStudentData,
  studentId,
  fetchStudent,
}) => {
  const { namelistId, batchId } = useParams();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API}/namelist/student`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            batchId,
            studentId,
            namelistId,
            studentDetail: {
              name: studentData.name,
              rollno: studentData.rollno,
              registration_no: studentData.registration_no,
            },
          }),
        }
      );
      if (response.ok) {
        fetchStudent();
        onRequestClose();
      } else {
        const errorData = await response.json();
        console.error(
          errorData.message || "An error occurred while editing the student"
        );
      }
    } catch (error) {
      console.error("An error occurred while editing the student");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex justify-center items-center fixed inset-0 z-50 outline-none focus:outline-none bg-black/50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-25"
    >
      <div className="relative w-96 my-6 mx-auto max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <img
          onClick={onRequestClose}
          className="ml-auto cursor-pointer"
          src={close}
        />
        <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Student Name
            </label>
            <input
              type="text"
              name="name"
              value={studentData.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Roll No
            </label>
            <input
              type="text"
              name="rollno"
              value={studentData.rollno}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Registeration No
            </label>
            <input
              type="text"
              name="registration_no"
              value={studentData.registration_no}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-auto"
            >
              update
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditNamelistModal;
