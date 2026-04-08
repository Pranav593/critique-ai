"use client";


import Link from "next/link";
import { useState } from "react";


export default function NewAssignmentPage() {
 const [title, setTitle] = useState("");
 const [subject, setSubject] = useState("");
 const [contextMode, setContextMode] = useState("rubric");
 const [contextStatement, setContextStatement] = useState("");
 const [rubricFile, setRubricFile] = useState(null);
 const [error, setError] = useState("");
 const [showSuccess, setShowSuccess] = useState(false);


 const handleSubmit = (e) => {
   e.preventDefault();
   setError("");
   setShowSuccess(false);


   if (!title.trim() || !subject.trim()) {
     setError("Title and Subject are required!");
     return;
   }


   console.log("Submitted:", { title, subject, contextMode, contextStatement, rubricFile });
   setShowSuccess(true);
 };


 return (
   <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 text-white flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
    
     {/* Branding Header - Extra Large with Navy Shadow */}
     <div className="mb-10 text-center">
       <h2 className="text-7xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white drop-shadow-[0_6px_6px_rgba(0,0,128,0.9)]">
         CritiqueAI
       </h2>
     </div>


     {/* The Central Box with Light Blue Border */}
     <div className="w-full max-w-lg bg-black/80 backdrop-blur-xl p-10 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)] relative overflow-hidden">
      
       <header className="text-center mb-8">
         <h1 className="text-3xl font-bold italic tracking-tight">
           Create Assignment
         </h1>
         {error && <p className="text-red-400 mt-4 font-bold">{error}</p>}
         {showSuccess && <p className="text-cyan-700 mt-4 font-bold">Success! Check console.</p>}
       </header>


       <form onSubmit={handleSubmit} className="space-y-6">
         <input
           placeholder="Assignment Title"
           className="w-full p-4 bg-white/5 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-zinc-500 text-center"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
         />
        
         <input
           placeholder="Subject / Course"
           className="w-full p-4 bg-white/5 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-zinc-500 text-center"
           value={subject}
           onChange={(e) => setSubject(e.target.value)}
         />


         {/* Context Toggle Buttons - Darker Blue */}
         <div className="flex bg-white/10 p-1 rounded-full border border-white/10">
           <button
             type="button"
             onClick={() => setContextMode("rubric")}
             className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${contextMode === "rubric" ? "bg-blue-700 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
           >
             Upload Rubric
           </button>
           <button
             type="button"
             onClick={() => setContextMode("statement")}
             className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${contextMode === "statement" ? "bg-blue-700 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
           >
             Context Statement
           </button>
         </div>


         <div className="text-center py-4 flex justify-center">
           {contextMode === "rubric" ? (
             <div className="bg-white/5 border border-dashed border-white/20 p-4 rounded-3xl w-full flex justify-center items-center">
               <input
                 type="file"
                 className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600 cursor-pointer"
                 onChange={(e) => setRubricFile(e.target.files[0])}
               />
             </div>
           ) : (
             <textarea
               placeholder="Enter context statement..."
               className="w-full p-4 bg-white/5 border border-white/20 rounded-[30px] focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-zinc-500"
               rows="3"
               value={contextStatement}
               onChange={(e) => setContextStatement(e.target.value)}
             />
           )}
         </div>


         <button
           type="submit"
           className="w-full bg-blue-700 hover:bg-blue-600 py-4 rounded-full font-bold text-white shadow-lg shadow-blue-900/40 transition-transform active:scale-95 italic text-lg"
         >
           Submit Assignment
         </button>
       </form>


       {/* Gray Dashboard Link at the bottom */}
       <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm underline block mt-8 text-center">
         ← Back to Dashboard
       </Link>
     </div>
   </div>
 );
}

