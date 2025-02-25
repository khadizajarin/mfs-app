"use client";
import { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/AuthProvider";
import Swal from "sweetalert2";



export default function Navbar() {
  const { user, loading, logOut } = useContext(AuthContext);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null; // Prevent flashing incorrect UI

  

  // Ensure `accountType` is available
  const userRole = user?.accountType || "guest";

  // Logout handler
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
  

  // Define menu items based on role
  const navItems = {
    user: [
      { name: "Home", href: "/homepage" },
      { name: "Transactions", href: "/transactions" },
      { name: "Cash-In", href: "/cash-in" },
      { name: "Cash-Out", href: "/cash-out" },
      { name: "Send Money", href: "/send-money" },
      { name: "Profile", href: "/profile" },
    ],
    agent: [
      { name: "Home", href: "/homepage" },
      { name: "Cash-In Requests", href: "/cash-in-requests" },
      { name: "Cash-Out", href: "/cash-out" },
      { name: "Balance Requests", href: "/balance-requests" },
      { name: "Profile", href: "/profile" },
    ],
    admin: [
      { name: "Dashboard", href: "/admin" },
      { name: "Manage Users", href: "/manage-users" },
      { name: "Approve Agents", href: "/approve-agents" },
      { name: "Transactions", href: "/transactions" },
      { name: "System Reports", href: "/system-reports" },
    ],
    guest: [
      { name: "Login", href: "/" },
      { name: "Register", href: "/register" },
    ],
  };

  return (
    <nav className="bg-blue-600 shadow-md text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo & Brand Name */}
        <Link href="/" className="text-2xl font-bold flex items-center">
          <span className="ml-2">MFS App</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6">
          {navItems[userRole]?.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className="hover:text-gray-200">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-2 space-y-2">
          {navItems[userRole]?.map((item) => (
            <Link key={item.name} href={item.href} className="block hover:text-gray-200">
              {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* Logout Button */}
      {user && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-300">Logged in as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          <button  onClick={handleLogOut} className="bg-red-500 px-4 py-2 rounded-md mt-2">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
