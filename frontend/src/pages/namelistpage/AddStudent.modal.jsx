import React from "react";
import Modal from "react-modal";

const AddStudentModal = ({
  isOpen,
  onRequestClose,
  studentName,
  setStudentName,
  rollNo,
  setRollNo,
  handleSubmit,
  error,
  title,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Student"
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-75 bg-gray-800"
      overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-75"
      ariaHideApp={false}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md mx-auto">
        <button
          onClick={onRequestClose}
          className="absolute top-2 right-2 text-gray-700"
        >
          &times;
        </button>
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <p className="mb-4 font-semibold text-lg">{title}</p>
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
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
          {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        </form>
      </div>
    </Modal>
  );
};

export default AddStudentModal;
