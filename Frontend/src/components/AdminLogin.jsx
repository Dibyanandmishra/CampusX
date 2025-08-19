import React, { useState } from "react";

const AdminLogin = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const expected = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === expected) { setError(""); onSuccess && onSuccess(); }
    else setError("Incorrect password. Please try again.");
  };
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter admin password" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Login</button>
        <p className="text-xs text-gray-500 mt-2">Default: admin123</p>
      </form>
    </div>
  );
};

export default AdminLogin;
