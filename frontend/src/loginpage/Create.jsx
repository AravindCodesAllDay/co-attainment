import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid Gmail address.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setEmailError("");
    setPasswordError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API}/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, pswd: password }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/");
      } else {
        setEmailError(data.message || "Failed to create user.");
      }
    } catch (error) {
      setEmailError("Network error. Please try again.");
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl mb-6 text-center">Create with Gmail</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 border w-full rounded"
              disabled={loading}
            />
            {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 border w-full rounded"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 border w-full rounded"
              disabled={loading}
            />
            {passwordError && (
              <p className="text-red-500 mt-2">{passwordError}</p>
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className={`border-2 border-none bg-green-600 text-xl text-white p-2 rounded-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;
