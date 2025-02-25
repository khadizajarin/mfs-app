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
    const adminEmail = user?.email;
    try {
      const response = await fetch("http://localhost:5000/api/admin/approve-agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, agentEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      Swal.fire("Success!", "Agent approved successfully!", "success");

      setAgents(agents.filter((agent) => agent.email !== agentEmail));
    } catch (error) {
      console.error("Approval error:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div >
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Admin Dashboard</h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Pending Agents</h3>

        {agents.length === 0 ? (
          <p className="text-gray-600 text-center">No pending agents.</p>
        ) : (
          <ul className="space-y-4">
            {agents.map((agent) => (
              <li key={agent._id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow">
                <span className="text-gray-800 font-medium">{agent.name} ({agent.email})</span>
                <Button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                  onClick={() => approveAgent(agent.email)}
                >
                  Approve
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
