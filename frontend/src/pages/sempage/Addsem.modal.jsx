import React, { useState } from "react";
import close from "../../assets/close.svg";
import { useParams } from "react-router-dom";

function AddSemModal({ isOpen, onClose, handleAddSem }) {
  const { bundleId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sem, setSem] = useState("");
  const [error, setError] = useState("");

  const postSem = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before submission

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/semester/${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: sem,
            bundleId: bundleId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Semester created", result);
      handleAddSem(result);
      setSem("");
      onClose();
    } catch (error) {
      console.error("Error posting the semester:", error);
      setError("Failed to create semester. Please try again.");
    }
  };

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
          className="absolute top-2 right-2 p-2 rounded cursor-pointer"
          onClick={onClose}
          src={close}
          alt="Close"
        />
        <h2 className="text-2xl mb-4">Add Semester</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={postSem}>
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
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-blue-500 text-white p-2 rounded mr-2 ${
                !sem && "opacity-50 cursor-not-allowed"
              }`}
              disabled={!sem}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSemModal;

// import React, { useState } from "react";
// import { useParams, useHistory } from "react-router-dom";
// import close from "../../assets/close.svg";

// function AddSemModal() {
//   const { bundleId } = useParams();
//   const history = useHistory();
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const [sem, setSem] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const postSem = async (e) => {
//     e.preventDefault();
//     setError(""); // Reset error before submission
//     setSuccess(""); // Reset success message before submission

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API}/bunsem/sem/${user.userId}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             title: sem,
//             bundleId: bundleId,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const result = await response.json();
//       console.log("Semester created", result);
//       setSem("");
//       setSuccess("Semester created successfully!");
//     } catch (error) {
//       console.error("Error posting the semester:", error);
//       setError("Failed to create semester. Please try again.");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-md relative">
//         <img
//           className="absolute top-2 right-2 p-2 rounded cursor-pointer"
//           onClick={() => history.goBack()}
//           src={close}
//           alt="Close"
//         />
//         <h2 className="text-2xl mb-4">Add Semester</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {success && <p className="text-green-500 mb-4">{success}</p>}
//         <form onSubmit={postSem}>
//           <div className="mb-4">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="sem"
//             >
//               Semester Name
//             </label>
//             <input
//               id="sem"
//               type="text"
//               value={sem}
//               onChange={(e) => setSem(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               placeholder="Enter semester name"
//               required
//             />
//           </div>
//           <div className="flex justify-end">
//             <button
//               type="submit"
//               className={`bg-blue-500 text-white p-2 rounded mr-2 ${
//                 !sem && "opacity-50 cursor-not-allowed"
//               }`}
//               disabled={!sem}
//             >
//               Submit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AddSemModal;
