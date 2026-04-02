import Link from "next/link";


const FAKE_ASSIGNMENT = {
 id: "sample-101",
 title: "Research synthesis: renewable energy adoption",
 subject: "Environmental Science 201",
 contextType: "rubric",
 contextPreview:
   "Rubric emphasizes thesis clarity, use of peer-reviewed sources, correct APA citations, and a conclusion that ties evidence to policy implications.",
 createdAtLabel: "Mar 20, 2026",
 draftsPreview: [
   { draftNumber: 1, submittedAt: "Mar 21, 2026", scores: { clarity: 6, structure: 7, evidence: 5, depth: 6 } },
   { draftNumber: 2, submittedAt: "Mar 24, 2026", scores: { clarity: 8, structure: 8, evidence: 7, depth: 7 } },
 ],
};


export default async function AssignmentDetailPage({ params }) {
 const { id } = await params;
 const a = FAKE_ASSIGNMENT;


 return (
   <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 text-white flex flex-col items-center p-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>


     {/* Branding Header */}
     <div className="mb-10 text-center mt-10">
       <h2 className="text-7xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white drop-shadow-[0_6px_6px_rgba(0,0,128,0.9)]">
         CritiqueAI
       </h2>
     </div>


     {/* Main Card */}
     <div className="w-full max-w-2xl bg-black/80 backdrop-blur-xl p-10 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">


    {/* Nav */}
    <div className="flex justify-between items-center mb-8">
         <p className="text-xs uppercase tracking-widest text-zinc-500">
           Assignment · ID: <span className="text-zinc-300">{id}</span>
         </p>
         <Link href="/assignments/new" className="text-blue-400 hover:text-white transition-colors text-sm font-bold">
           + New Assignment
         </Link>
       </div>
      
       <h1 className="text-3xl font-bold italic tracking-tight mb-4">
         {a.title}
       </h1>


       {/* Tags */}
       <div className="flex flex-wrap gap-3 mb-8 text-sm">
         <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/90">
           {a.subject}
         </span>
         <span className="px-4 py-1 rounded-full bg-blue-700/30 border border-blue-400/30 text-blue-300">
           {a.contextType === "rubric" ? "Rubric-based" : "Statement"}
         </span>
         <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
           Created {a.createdAtLabel}
         </span>
       </div>


       {/* Rubric / Context Section */}
       <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 mb-8">
         <h2 className="text-lg font-bold italic mb-3">Rubric / Context</h2>
         <p className="text-zinc-400 leading-relaxed">{a.contextPreview}</p>
       </div>


       {/* Drafts Section */}
       <div>
         <h2 className="text-lg font-bold italic mb-2">Drafts (preview)</h2>
         <p className="text-sm text-zinc-500 mb-6">
           Scores and feedback will load from Firestore in a later week. Showing placeholder cards for now.
         </p>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {a.draftsPreview.map((d) => (
             <div key={d.draftNumber} className="bg-black/40 border border-white/10 rounded-[24px] p-5 hover:border-blue-400/40 transition-all">
               <div className="flex justify-between items-center mb-4">
                 <span className="font-bold text-white">Draft {d.draftNumber}</span>
                 <span className="text-xs text-zinc-500">{d.submittedAt}</span>
               </div>
               <div className="grid grid-cols-2 gap-2 text-sm">
                 {[
                   ["Clarity", d.scores.clarity],
                   ["Structure", d.scores.structure],
                   ["Evidence", d.scores.evidence],
                   ["Depth", d.scores.depth],
                 ].map(([label, val]) => (
                   <div key={label} className="flex justify-between bg-white/5 rounded-xl px-3 py-2">
                     <span className="text-zinc-400">{label}</span>
                     <span className="font-mono font-bold text-blue-300">{val}/10</span>
                   </div>
                 ))}
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>
   </div>
 );
}



