import Link from "next/link";

export default function AssignmentCard({ assignment }) {
  return (
    <Link href={`/assignments/${assignment.id}`}>
      <div className="border rounded-lg p-4 shadow hover:shadow-md cursor-pointer">
        <h2 className="text-lg font-semibold mb-2">
          {assignment.title}
        </h2>

        <p>Subject: {assignment.subject}</p>
        <p>Drafts: {assignment.drafts}</p>
        <p>Date Created: {assignment.dateCreated}</p>
      </div>
    </Link>
  );
}