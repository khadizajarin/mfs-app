"use client";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/AuthProvider";
import Navbar from "../homepage/navbar";

export default function SendMoney() {
  const { user } = useContext(AuthContext);
  const [senderMobile, setSenderMobile] = useState(""); // Store the sender's mobile number
  const [recipientMobile, setRecipientMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const senderEmail = user?.email; // Retrieve the sender's email from AuthContext

  // Fetch the sender's mobile number from the backend
  useEffect(() => {
    if (!senderEmail) return;

    const fetchSenderMobile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/get-mobile?email=${senderEmail}`);
        const data = await response.json();
        if (response.ok) {
          setSenderMobile(data.mobile); // Set the sender's mobile number
        } else {
          throw new Error(data.message || "Failed to fetch mobile number");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    };

    fetchSenderMobile();
  }, [senderEmail]);

  const handleSendMoney = async (e) => {
    e.preventDefault();

    if (!senderMobile || !recipientMobile || !amount || amount < 50) {
      return Swal.fire("Error", "Please fill in all fields and ensure the amount is at least 50 Taka.", "error");
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/transactions/send-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderMobile,
          recipientMobile,
          amount: Number(amount),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      Swal.fire("Success", data.message, "success");
      router.push("/homepage");
    } catch (error) {
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
          <h2 className="text-2xl font-bold text-center text-gray-800">Send Money</h2>
          <form onSubmit={handleSendMoney}>
            {/* Sender Mobile Number Display */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Your Mobile Number</label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={senderMobile || "Fetching..."}
                disabled
              />
            </div>
            {/* Recipient Mobile Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Recipient Mobile</label>
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                placeholder="Enter recipient's phone number"
                value={recipientMobile}
                onChange={(e) => setRecipientMobile(e.target.value)}
                required
              />
            </div>
            {/* Amount Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">Amount (Taka)</label>
              <input
                type="number"
                className="input input-bordered w-full mt-1"
                placeholder="Minimum 50 Taka"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Money"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
