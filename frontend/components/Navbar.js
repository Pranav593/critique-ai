export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <p className="font-medium">student@example.com</p>

      <button className="bg-black text-white px-4 py-2 rounded">
        Logout
      </button>
    </nav>
  );
}