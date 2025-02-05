import React from "react";
import Navbar from "../../components/Navbar";
import edit from "../../assets/edit.svg";

function ViewSaa() {
  // Sample data for demonstration purposes
  const students = [
    { name: "Alice", rollNo: 1, understand: "Yes", apply: "Yes" },
    { name: "Bob", rollNo: 2, understand: "No", apply: "Yes" },
    { name: "Charlie", rollNo: 3, understand: "Yes", apply: "No" },
  ];

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Student Information</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-300  text-center bg-gray-700 text-white">
                  Actions
                </th>
                <th className="py-2 px-4 border-b border-gray-300 bg-gray-700 text-white text-center">
                  Student's Name
                </th>
                <th className="py-2 px-4 border-b border-gray-300 bg-gray-700 text-white text-center">
                  Roll No
                </th>
                <th className="py-2 px-4 border-b border-gray-300 bg-gray-700 text-white text-center">
                  Understand
                </th>
                <th className="py-2 px-4 border-b border-gray-300 bg-gray-700 text-white text-center">
                  Apply
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b border-gray-300 text-center">
                    <img className="cursor-pointer" src={edit} alt="Edit" />
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-center">
                    {student.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-center">
                    {student.rollNo}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-center">
                    {student.understand}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-center">
                    {student.apply}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ViewSaa;
