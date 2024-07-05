import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    const checkLogin = () => {
      if (user) {
        navigate("/namelists");
      }
    };
    checkLogin();
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (emailPattern.test(email)) {
      setEmailError("");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API}/user/${email}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("user", JSON.stringify(data));

          navigate("/namelists");
        } else {
          const data = await response.json();
          console.error("Error logging in:", data.message);
        }
      } catch (error) {
        console.error("Error logging in:", error);
      }
    } else {
      setEmailError("Please enter a valid Gmail address.");
    }
  };

  return (
    <div className="flex items-center flex-col justify-center min-h-screen bg-gray-100 font-primary">
      <div>
        <h2 className="text-3xl font-bold mb-10 text-blue-600">
          Welcome to Co-attainment Portal
        </h2>
      </div>
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-6 text-center">Login with Gmail</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 border w-full rounded"
            />
            {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="border-2 border-none bg-green-600 text-xl text-white p-2 rounded-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
