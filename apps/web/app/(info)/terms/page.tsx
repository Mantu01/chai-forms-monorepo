import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Scale, ShieldAlert, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <div className="max-w-3xl w-full text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-2xs text-zinc-400">
          <Scale className="h-3 w-3 text-primary" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-zinc-500 text-xs font-mono">Last updated: May 25, 2026</p>
      </div>

      <CardSection />

      <div className="relative z-10">
        <Link href="/profile">
          <Button variant="outline" className="rounded-xl h-10 px-5 gap-1.5 border-zinc-855 bg-zinc-900/40">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function CardSection() {
  return (
    <div className="max-w-2xl w-full bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 space-y-6 relative z-10 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
      <div className="space-y-2">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-primary" />
          1. Workspace Usage
        </h3>
        <p className="text-zinc-400 text-xs pl-5">
          By registering an account and organizing workspaces, you represent that all template files, questions, labels, and configurations comply with local legislation and public decency policies.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          2. Proper Conduct & Public Sharing
        </h3>
        <p className="text-zinc-400 text-xs pl-5">
          When toggling public template status, forms are featured in the public directory where anyone can preview and comment. You retain intellectual property, but grant other platform members authorization to clone form definitions.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <Scale className="h-4 w-4 text-cyan-400" />
          3. Submissions & Export Liability
        </h3>
        <p className="text-zinc-400 text-xs pl-5">
          ChaiForm is not responsible for the accuracy of submitted user responses. Collected content must not collect passwords, financial keys, or personal identifying info without explicit compliance disclosures.
        </p>
      </div>
    </div>
  );
}
