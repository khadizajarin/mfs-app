"use client";

import axios from "axios";
import Link from "next/link";
import Swal from "sweetalert2";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/AuthProvider";

export default function Home() {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        title: "Warning!",
        text: "Please enter email and password",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    try {
      await signIn(email, password);
      router.push("/homepage");
      Swal.fire({
        title: "Success!",
        text: "Successfully logged in!",
        icon: "success",
        confirmButtonText: "Ok",
      });
    } catch (error) {
      console.error(error);
      let errorMessage = "An error occurred. Please try again.";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password!";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please sign up.";
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <div>
      <h1>React + Node.js Connection</h1>
      <p>{message}</p>

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

          {/* Role Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Select Role</label>
            <select
              className="select select-bordered w-full mt-1"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Email Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              className="input input-bordered w-full mt-1"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              className="input input-bordered w-full mt-1"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Button */}
          <button className="btn btn-primary w-full mt-6" onClick={handleLogin}>
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>

          {/* Register Link */}
          <p className="text-sm text-center mt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


