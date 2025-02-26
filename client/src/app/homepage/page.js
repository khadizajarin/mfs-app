"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/AuthProvider";
import Swal from "sweetalert2";
import PrivateRoute from "../components/PrivateRoute";
import Navbar from "./navbar";
import Button from "../commoncomps/Button";

export default function Homepage() {
  const router = useRouter();
  const { user, logOut } = useContext(AuthContext);
  const [isClient, setIsClient] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [totalSystemBalance, setTotalSystemBalance] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user?.accountType === "admin") {
      const fetchTotalBalance = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/total-money");
          const data = await response.json();
  
          if (response.ok) {
            setTotalSystemBalance(data.total); // ✅ Directly use the "total" from API response
          } else {
            setTotalSystemBalance(0);
          }
        } catch (error) {
          console.error("Error fetching total system balance:", error);
          setTotalSystemBalance(0);
        }
      };
  
      fetchTotalBalance();
    }
  }, [user]); // ✅ Runs when user changes
  

  const handleLogOut = () => {
    logOut()
      .then(() => {
        router.push("/");
        Swal.fire("Logged Out!", "You are logged out successfully!", "success");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (!isClient || !user) return null;

  // ✅ Identify the user role and balance
  const userRole = user.accountType || "user"; // Default to user
  const userBalance = userRole === "admin" ? totalSystemBalance : user.balance || 0; // Default to 0

  // ✅ Define background colors based on role
  const roleColors = {
    user: "bg-[#F7CFD8]", // Light Pink
    agent: "bg-[#F4F8D3]", // Light Green
    admin: "bg-[#A6F1E0]", // Light Teal
  };

  // ✅ Balance Display Logic
  const balanceText =
    userRole === "admin"
      ? `Total Money in System: ${userBalance} Taka`
      : `Balance: ${userBalance} Taka`;

  // ✅ Role-specific content
  const roleContent = {
    admin: [
      { name: "Dashboard", link: "/admin/dashboard", size: "col-span-2" },
      { name: "Manage Users", link: "/admin/manage-users", size: "col-span-1" },
      { name: "Approve Agents", link: "/admin/approve-agents", size: "row-span-2" },
      { name: "Transactions", link: "/admin/transactions", size: "col-span-1" },
      { name: "System Reports", link: "/admin/system-reports", size: "col-span-2" },
    ],
    agent: [
      { name: "Home", link: "/homepage", size: "col-span-2" },
      { name: "Cash-In Requests", link: "/agent/cash-in-requests", size: "col-span-2" },
      { name: "Balance Requests", link: "/agent/balance-requests", size: "col-span-1" },
      { name: "Transactions", link: "/transactions", size: "row-span-1" },
      { name: "Profile", link: "/agent/profile", size: "col-span-2" },
    ],
    user: [
      { name: "Home", link: "/homepage", size: "col-span-2" },
      { name: "Transactions", link: "/transactions", size: "row-span-2" },
      { name: "Cash-Out", link: "/cash-out", size: "col-span-1" },
      { name: "Send Money", link: "/send-money", size: "col-span-1" },
      { name: "Profile", link: "/profile", size: "col-span-2" },
    ],
  };

 
  return (
    <PrivateRoute>
      <Navbar />
      <div className="lg:min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">

          <div className="flex flex-row space-x-3 items-center" >
            <div>
              <h1 className="text-2xl font-bold text-center text-gray-800">Welcome</h1>
              <p className="text-gray-600 mt-2">You are logged in as:</p>
              <p className="text-lg font-semibold text-gray-700 mt-1">{user.email || "Guest"}</p>
            </div>

            <div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className={`${roleColors[userRole]} px-4 py-2 rounded-md mt-4 transition-all`}
                >
                <span
                  className={`relative inline-block font-semibold text-gray-500 rounded-lg transition-all duration-500 ${
                    showBalance
                      ? "blur-0 translate-x-0 opacity-100"
                      : "blur-md translate-x-6 opacity-50"
                  }`}
                >
                  {balanceText}
                </span>
              </button>
            </div>
          </div>
          
          {/* ✅ Balance Button */}
          

          <div className="mt-6 grid grid-cols-2 gap-6 text-gray-700">
            {roleContent[userRole]?.map((item) => (
              <div
                key={item.name}
                className={`p-4 shadow-md rounded-md text-center ${item.size} ${roleColors[userRole]} hover:bg-opacity-80 transition-all cursor-pointer`}
                onClick={() => router.push(item.link)}
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
              </div>
            ))}
          </div>

          <Button
            onClick={handleLogOut}
            className={`${roleColors[userRole]} px-4 py-2 rounded-md mt-6 transition`}
          >
            Logout
          </Button>
        </div>
      </div>
    </PrivateRoute>
  );
}
