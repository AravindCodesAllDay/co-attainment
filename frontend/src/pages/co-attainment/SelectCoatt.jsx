// import React, { useState, useEffect } from "react";
// import Navbar from "../../components/Navbar";
// import { useParams } from "react-router-dom";

// function SelectCoatt() {
//   const [selectOptions, setSelectOptions] = useState([]);
//   const [selects, setSelects] = useState([0]); // Initial state with one select
//   const [selectcourse, setselectcourse] = useState([0]);
//   const [pt, setpt] = useState([0]); //select pt
//   const [course, setcourse] = useState([0]); //select setcourse
//   const [see, setsee] = useState([0]); //select see
//   const [loading, setLoading] = useState(true); // Loading state
//   const { bundleId, semesterId } = useParams();
//   const user = JSON.parse(localStorage.getItem("user"));

//   //select Pt from the API links
//   const fetchPts = async () => {
//     try {
//       const response1 = await fetch(
//         `${import.meta.env.VITE_API}/pt/${bundleId}/${semesterId}/${
//           user.userId
//         }`
//       );

//       if (!response1.ok) {
//         throw new Error("Network response for pts was not ok");
//       }
//       const data1 = await response1.json();
//       setselectcourse(data1);
//       setLoading(false); // Set loading to false after data is fetched
//     } catch (error) {
//       console.error("Failed to fetch data:", error);
//       setLoading(false); // Set loading to false on error as well
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchPts();
//     }
//   }, [user]);

//   //course section fetch point
//   const fetchcourse = async () => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API}/course/${bundleId}/${semesterId}/${
//           user.userId
//         }`
//       );
//       if (!response.ok) {
//         throw new Error("Error fetching the courses");
//       }
//       const data = await response.json();
//       setSelects(data);
//       setLoading(false);
//     } catch (error) {
//       console.log("Error while fetching the course API");
//     }
//   };

//   useEffect(() => {
//     fetchcourse();
//   }, [user]);

//   //select see from the API
//   const fetchsee = async () => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API}/see/${bundleId}/${semesterId}/${
//           user.userId
//         }`
//       );

//       if (!response.ok) {
//         throw new Error("Error while fetching the API for the see category");
//       }
//       const data = await response.json();
//       setSelectOptions(data);
//       setLoading(false);
//     } catch (error) {
//       console.log("Erro while logging into the see");
//     }
//   };

//   useEffect(() => {
//     fetchsee();
//   }, [user]);

//   // const handleCreateButtonClick = () => {
//   //   setSelects([...selects, selects.length]); // Add a new select
//   // };

//   return (
//     <>
//       <Navbar />
//       <div className="flex flex-col justify-center items-center mt-2 p-2">
//         <div className="flex flex-col gap-5 border-2 border-gray-600 p-2 w-96 items-center rounded-md">
//           {/* <button
//             onClick={handleCreateButtonClick}
//             className="bg-red-600 text-white text-xl p-2 mt-4 rounded-md hover:bg-green-500"
//           >
//             Add
//           </button> */}

//           <h2 className="font-bold">Select Course...</h2>
//           {/* for course */}
//           {loading ? (
//             <p>Loading...</p>
//           ) : (
//             course.map((_, index) => (
//               <div key={index} className="mt-4">
//                 <select className="border-2 border-gray-600 p-2 rounded-md w-full">
//                   {selects.map((option, optionIndex) => (
//                     <option key={optionIndex} value={option._id}>
//                       {option.title}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ))
//           )}

//           <h2 className="font-bold">Select Pt's...</h2>

//           {loading ? (
//             <p>Loading...</p>
//           ) : (
//             pt.map((_, index) => (
//               <div key={index} className="mt-4">
//                 <select className="border-2 border-gray-600 p-2 rounded-md w-full">
//                   {selectcourse.map((option, optionIndex) => (
//                     <option key={optionIndex} value={option._id}>
//                       {option.title}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ))
//           )}

//           <h2 className="font-bold">Select See...</h2>

//           {loading ? (
//             <p>Loading...</p>
//           ) : (
//             see.map((_, index) => (
//               <div key={index} className="mt-4">
//                 <select className="border-2 border-gray-600 p-2 rounded-md w-full">
//                   {selectOptions.map((option, optionIndex) => (
//                     <option key={optionIndex} value={option._id}>
//                       {option.title}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ))
//           )}
//           <button className="bg-green-600 text-white p-3 rounded-md ">
//             Submit
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// export default SelectCoatt;

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";

function SelectCoatt() {
  const [selectOptions, setSelectOptions] = useState([]);
  const [selects, setSelects] = useState([]);
  const [selectcourse, setselectcourse] = useState([]);
  const [pt, setpt] = useState([]);
  const [course, setcourse] = useState([]);
  const [see, setsee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainSelection, setMainSelection] = useState("course"); // Default selection
  const [dropdowns, setDropdowns] = useState([{ id: 0, type: "course" }]); // Initial dropdown state
  const { bundleId, semesterId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        fetch(
          `${import.meta.env.VITE_API}/pt/${bundleId}/${semesterId}/${
            user.userId
          }`
        ),
        fetch(
          `${import.meta.env.VITE_API}/course/${bundleId}/${semesterId}/${
            user.userId
          }`
        ),
        fetch(
          `${import.meta.env.VITE_API}/see/${bundleId}/${semesterId}/${
            user.userId
          }`
        ),
      ]);

      if (!responses.every((response) => response.ok)) {
        throw new Error("One or more network responses were not ok");
      }

      const [ptData, courseData, seeData] = await Promise.all(
        responses.map((response) => response.json())
      );

      setselectcourse(ptData);
      setSelects(courseData);
      setSelectOptions(seeData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleMainSelectionChange = (e) => {
    setMainSelection(e.target.value);
  };

  const handleDropdownTypeChange = (id, value) => {
    setDropdowns(
      dropdowns.map((dropdown) =>
        dropdown.id === id ? { ...dropdown, type: value } : dropdown
      )
    );
  };

  const addDropdown = () => {
    setDropdowns([...dropdowns, { id: dropdowns.length, type: "course" }]);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mt-2 p-2">
        <div className="flex flex-col gap-5 border-2 border-gray-600 p-2 w-96 items-center rounded-md">
          <button
            onClick={addDropdown}
            className="bg-red-600 text-white text-xl p-2 mt-4 rounded-md hover:bg-green-500"
          >
            Add Dropdown
          </button>

          {dropdowns.map((dropdown) => (
            <div key={dropdown.id} className="flex flex-col gap-4 mt-4 w-full">
              <select
                value={dropdown.type}
                onChange={(e) =>
                  handleDropdownTypeChange(dropdown.id, e.target.value)
                }
                className="border-2 border-gray-600 p-2 rounded-md w-full"
              >
                <option value="course">Course</option>
                <option value="pt">Pt</option>
                <option value="see">See</option>
              </select>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <select className="border-2 border-gray-600 p-2 rounded-md w-full">
                  {dropdown.type === "course" &&
                    course.map((option, optionIndex) => (
                      <option key={optionIndex} value={option._id}>
                        {option.title}
                      </option>
                    ))}
                  {dropdown.type === "pt" &&
                    selectcourse.map((option, optionIndex) => (
                      <option key={optionIndex} value={option._id}>
                        {option.title}
                      </option>
                    ))}
                  {dropdown.type === "see" &&
                    selectOptions.map((option, optionIndex) => (
                      <option key={optionIndex} value={option._id}>
                        {option.title}
                      </option>
                    ))}
                </select>
              )}
            </div>
          ))}

          <button className="bg-green-600 text-white p-3 rounded-md mt-4">
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default SelectCoatt;
