"use client";

import { useRouter } from "next/navigation";

export default function AssignmentCard({ assignment }) {
  const router = useRouter();

  const createdDate = assignment.createdAt?.toDate
    ? assignment.createdAt.toDate().toLocaleDateString()
    : "No date";

  return (
    <div
      onClick={() => router.push(`/assignments/${assignment.id}`)}
      className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {assignment.title}
      </h2>

      <p className="text-gray-600 mb-1">
        <span className="font-medium">Subject:</span> {assignment.subject}
      </p>

      <p className="text-gray-600 mb-1">
        <span className="font-medium">Drafts:</span> {assignment.draftCount || 0}
      </p>

      <p className="text-sm text-gray-500 mt-3">
        Created: {createdDate}
      </p>
    </div>
  );
}