"use client";

import { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Navbar from "../homepage/navbar";
import { AuthContext } from "@/lib/AuthProvider";
import Button from "../commoncomps/Button";

export default function CashOut() {
  const { user } = useContext(AuthContext);
  const [userMobile, setUserMobile] = useState(""); // Store the user's mobile number
  const [agentMobile, setAgentMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const senderEmail = user?.email; // Retrieve the sender's email from AuthContext

  // ✅ Define background colors based on role
  const roleColors = {
    user: "bg-[#F7CFD8] hover:bg-[#e7b6c2]", // Light Pink
    agent: "bg-[#F4F8D3] hover:bg-[#e0e8b5]", // Light Green
  };

  // ✅ Identify user role
  const userRole = user?.accountType || "user"; // Default to user

  // ✅ Fetch the user's mobile number from the backend
  useEffect(() => {
    if (!senderEmail) return;

    const fetchUserMobile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/get-mobile?email=${senderEmail}`);
        const data = await response.json();
        if (response.ok) {
          setUserMobile(data.mobile); // Set the user's mobile number
        } else {
          throw new Error(data.message || "Failed to fetch mobile number");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    };

    fetchUserMobile();
  }, [senderEmail]);

  const handleCashOut = async (e) => {
    e.preventDefault();

    console.log("Agent Mobile:", agentMobile); // Check the value of agentMobile here

    if (!userMobile || !agentMobile || !amount || amount < 100 || !pin) {
      return Swal.fire("Error", "Please fill in all fields and ensure the amount is at least 100 Taka.", "error");
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/transactions/cash-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMobile,
          agentMobile,
          amount: Number(amount),
          pin,
        }),
      });

      // ✅ Check if response status is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.message || "Failed to process cash-out.");
      }

      const data = await response.json();
      console.log("Success response:", data);

      Swal.fire("Success", data.message, "success");
      router.push("/homepage");
    } catch (error) {
      console.error("Error during cash-out:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <Navbar />
      <div className="pt-8 flex items-center justify-center ">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
          <h2 className="text-2xl font-bold text-center text-gray-800">Cash-Out</h2>
          <form onSubmit={handleCashOut}>
            {/* User Mobile Number Display */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Your Mobile Number</label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={userMobile || "Fetching..."}
                disabled
              />
            </div>
            {/* Agent Mobile Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Agent Mobile</label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                placeholder="Enter agent's mobile number"
                value={agentMobile}
                onChange={(e) => setAgentMobile(e.target.value)}
                required
              />
            </div>
            {/* Amount Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Amount (Taka)</label>
              <input
                type="number"
                className="input input-bordered w-full mt-1"
                placeholder="Minimum 100 Taka"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            {/* PIN Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Account PIN</label>
              <input
                type="password"
                className="input input-bordered w-full mt-1"
                placeholder="Enter your account PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
            {/* Submit Button with Dynamic Color */}
            <Button
              type="submit"
              className={`w-full mt-6 text-gray-900 ${roleColors[userRole]} px-4 py-2 rounded-md transition`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Cash-Out"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
