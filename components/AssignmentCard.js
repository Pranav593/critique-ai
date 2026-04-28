"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/Context/AuthContext";
import { updateAssignment } from "@/lib/firebase";

export default function AssignmentCard({ assignment, onUpdate }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(assignment.title);
  const [editSubject, setEditSubject] = useState(assignment.subject);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!editTitle.trim() || !editSubject.trim()) return;
    setSaving(true);
    try {
      await updateAssignment(user.uid, assignment.id, {
        title: editTitle,
        subject: editSubject,
      });
      assignment.title = editTitle;
      assignment.subject = editSubject;
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditTitle(assignment.title);
    setEditSubject(assignment.subject);
    setIsEditing(false);
  };

  return (
    <div
      onClick={() => (!isEditing ? router.push(`/assignments/${assignment.id}`) : null)}
      className={`bg-white border border-[#1A1A1A] p-8 shadow-none transition-colors rounded-none flex flex-col justify-between ${!isEditing ? "hover:bg-gray-50 cursor-pointer" : ""}`}
    >
      <div>
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()} className="space-y-4 mb-6">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-xl font-light tracking-wide uppercase text-[#1A1A1A] border border-[#1A1A1A] p-2 bg-transparent focus:outline-none"
              placeholder="TITLE"
            />
            <input
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="w-full text-xs font-medium tracking-wide uppercase text-gray-500 border border-[#1A1A1A] p-2 bg-transparent focus:outline-none"
              placeholder="SUBJECT"
            />
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-light tracking-wide uppercase text-[#1A1A1A] mb-3">
              {assignment.title}
            </h2>
            <p className="text-gray-500 font-medium tracking-wide uppercase text-xs mb-6">
              {assignment.subject}
            </p>
          </>
        )}
      </div>

      <div className="flex justify-between items-end border-t border-gray-200 pt-4 mt-4">
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()} className="flex gap-2 w-full">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#1A1A1A] text-white px-2 py-2 text-[10px] uppercase tracking-widest font-medium border border-[#1A1A1A] hover:bg-black transition-colors rounded-none disabled:opacity-50"
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-transparent text-[#1A1A1A] px-2 py-2 text-[10px] uppercase tracking-widest font-medium border border-[#1A1A1A] hover:bg-gray-100 transition-colors rounded-none"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-[#1A1A1A] font-medium">
              DRAFTS: <span className="font-light">{assignment.draftCount || 0}</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-[10px] uppercase tracking-widest text-[#1A1A1A] hover:text-blue-600 transition-colors font-medium"
              >
                Edit
              </button>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {assignment.createdAt?.toDate
                  ? assignment.createdAt.toDate().toLocaleDateString()
                  : "Recently"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}