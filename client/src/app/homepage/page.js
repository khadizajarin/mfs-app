"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/AuthProvider";
import Swal from "sweetalert2";
import PrivateRoute from "../components/PrivateRoute";
import Navbar from "./navbar";

export default function Homepage() {
  const router = useRouter();

    const  {user, logOut} = useContext(AuthContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogOut = () => {
      logOut()
      .then( () => {
          router.push( "/");
          Swal.fire(
              'Logged Out!',
              'You are logged out successfully!',
              'success'
            )
      })
      .catch( error => {
          console.error(error);
      })
  }

  if (!isClient) return null;

  return (

    <PrivateRoute>
      <Navbar></Navbar>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
          <p className="text-gray-600 mt-2">You are logged in as:</p>
          <p className="text-lg font-semibold text-gray-700 mt-1">{user?.email || "Guest"}</p>

          <button
            onClick={handleLogOut}
            className="btn btn-error w-full mt-6"
          >
            Logout
          </button>
        </div>
      </div>
    </PrivateRoute>
    
  );
}
