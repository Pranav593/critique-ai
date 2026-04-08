import Link from "next/link";
import Navbar from "../../components/Navbar";
import AssignmentCard from "../../components/AssignmentCard";
import { assignments } from "../../data/assignments";

export default function Page() {
  return (
    <div>
      <Navbar />

      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Assignments</h1>

          <Link
            href="/assignments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            New Assignment
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="border border-dashed rounded-lg p-10 text-center">
            <h2 className="text-xl font-semibold mb-2">No assignments yet</h2>
            <p className="text-gray-600">
              Create a new assignment to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}