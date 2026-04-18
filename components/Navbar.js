import { useAuth } from "@/app/Context/AuthContext";

export default function Navbar() {

  const {user, logout} = useAuth();
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <p className="font-medium">{user && <span>{user.email}</span>}</p>

      <button className="bg-black text-white px-4 py-2 rounded" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}