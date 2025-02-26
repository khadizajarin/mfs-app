"use client";
import { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Navbar from "../homepage/navbar";
import { AuthContext } from "@/lib/AuthProvider";

export default function CashOut() {
  const { user } = useContext(AuthContext);
  const [userMobile, setUserMobile] = useState(""); // User's mobile number
  const [agentMobile, setAgentMobile] = useState(""); // Agent's mobile number
  const [amount, setAmount] = useState(""); // Cash-in amount
  const [pin, setPin] = useState(""); // User PIN
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentPin, setAgentPin] = useState(""); // Store agent PIN from database
  const router = useRouter();

  const senderEmail = user?.email; // Get sender email from AuthContext

  // Fetch the agent's mobile and PIN from the backend
  useEffect(() => {
    if (!senderEmail) return;

    const fetchAgentInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/get-agent?email=${senderEmail}`);
        const data = await response.json();
        if (response.ok) {
          setAgentMobile(data.mobile); // ✅ Set agent's mobile number
          setAgentPin(data.pin); // ✅ Set agent's PIN from database
        } else {
          throw new Error(data.message || "Failed to fetch agent info");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    };

    fetchAgentInfo();
  }, [senderEmail]);

  const handleCashIn = async (e) => {
    e.preventDefault();

    // ✅ Validate inputs
    if (!userMobile || !amount || amount < 100 || !pin) {
      return Swal.fire("Error", "Please fill in all fields and ensure the amount is at least 100 Taka.", "error");
    }

    // console.log(pin == agentPin);
    // console.log(pin)
    // console.log(agentPin)
    // // ✅ Compare PIN with the actual agent PIN from the database
    // if (pin !== agentPin) {
    //   return Swal.fire("Error", "Incorrect agent PIN. Please try again.", "error");
    // }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/transactions/cash-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentMobile,
          userMobile,
          amount: Number(amount),
          pin, // ✅ Send the entered PIN
        }),
      });

      // ✅ Check response status
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.message || "Failed to process cash-in.");
      }

      const data = await response.json();
      console.log("Success response:", data);

      Swal.fire("Success", data.message, "success");

      // ✅ Redirect to homepage after success
      router.push("/homepage");
    } catch (error) {
      console.error("Error during cash-in:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center text-gray-800">Cash-In</h2>
          <form onSubmit={handleCashIn}>
            {/* Agent Mobile (Disabled) */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Agent Mobile</label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={agentMobile || "Fetching..."}
                disabled
              />
            </div>

            {/* User Mobile Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">User Mobile Number</label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                placeholder="Enter receiver's mobile number"
                value={userMobile}
                onChange={(e) => setUserMobile(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-600">Agent PIN</label>
              <input
                type="password"
                className="input input-bordered w-full mt-1"
                placeholder="Enter agent's PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Cash-In to User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
