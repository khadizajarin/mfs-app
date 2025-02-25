"use client";
import { AuthContext } from "@/lib/AuthProvider";
import { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import Navbar from "../homepage/navbar";

export default function AdminDashboard() {
    const { user } = useContext(AuthContext); 
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/pending-agents")
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch((error) => console.error("Error fetching agents:", error));
  }, []);

  const approveAgent = async (agentEmail) => {
    const adminEmail = user?.email; // ✅ Get logged-in admin email
  
    console.log("Sending approval request as admin:", adminEmail); // ✅ Debugging Log
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/approve-agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, agentEmail }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
  
      Swal.fire("Success!", "Agent approved successfully!", "success");
  
      // Remove approved agent from the list
      setAgents(agents.filter((agent) => agent.email !== agentEmail));
    } catch (error) {
      console.error("Approval error:", error);
      Swal.fire("Error", error.message, "error");
    }
  };
  

  return (
    <div>
        <Navbar></Navbar>
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
        <h3 className="text-xl font-semibold text-gray-700">Pending Agents</h3>

        {agents.length === 0 ? (
            <p className="text-gray-600">No pending agents.</p>
        ) : (
            <ul className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
            {agents.map((agent) => (
                <li key={agent._id} className="flex justify-between items-center p-2 border-b">
                <span>{agent.name} ({agent.email})</span>
                <button
                    className="btn btn-success"
                    onClick={() => approveAgent(agent.email)}
                >
                    Approve
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>

    </div>
    
  );
}
