"use client";

import { useRouter } from "next/navigation";

export default function AssignmentCard({ assignment }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/assignments/${assignment.id}`)}
      className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {assignment.title}
      </h2>

      <p className="text-gray-600 mb-2">{assignment.subject}</p>

      <p className="text-sm text-gray-500 mb-1">
        {assignment.draftCount || 0} drafts
      </p>

      <p className="text-sm text-gray-400">
        Created {assignment.createdAt?.toDate
          ? assignment.createdAt.toDate().toLocaleDateString()
          : "Recently"}
      </p>
    </div>
  );
}