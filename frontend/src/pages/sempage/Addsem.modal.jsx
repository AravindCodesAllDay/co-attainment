import React, { useState } from "react";
import close from "../../assets/close.svg";

function Addsemmodal({ isOpen, onClose, handleAddSem }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sem, setSem] = useState("");

  const postsem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/bunsem/sem/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: sem,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Sem created", result);
      handleAddSem(sem);
      setSem("");
      onClose();
    } catch (error) {
      console.log("Error POsting the sem");
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   handleAddSem(sem);
  //   setSem(""); // Reset the input field
  //   onClose();
  // };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          className="absolute top-2 right-2  p-2 rounded cursor-pointer"
          onClick={onClose}
          src={close}
        />
        <h2 className="text-2xl mb-4">Add Semester</h2>
        <form onSubmit={postsem}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="sem"
            >
              Semester Name
            </label>
            <input
              id="sem"
              type="text"
              value={sem}
              onChange={(e) => setSem(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter semester name"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded mr-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Addsemmodal;
