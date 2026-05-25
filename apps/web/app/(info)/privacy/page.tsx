import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      <div className="max-w-3xl w-full text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-2xs text-zinc-400">
          <Shield className="h-3 w-3 text-emerald-450 animate-pulse" />
          <span>Security Statement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-zinc-500 text-xs font-mono">Last updated: May 25, 2026</p>
      </div>

      <CardSection />

      <div className="relative z-10">
        <Link href="/profile">
          <Button variant="outline" className="rounded-xl h-10 px-5 gap-1.5 border-zinc-850 bg-zinc-900/40">
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
          <Lock className="h-4 w-4 text-emerald-400" />
          1. Data Encryption & Storage
        </h3>
        <p className="text-zinc-400 text-xs pl-5">
          Any form submission received is recorded inside our database instance securely. Answer data arrays are matched against generated field structure rules and private tokens.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-cyan-400" />
          2. Access Control & Visibility
        </h3>
        <p className="text-zinc-400 text-xs pl-5">
          Form presets marked private are accessible solely to authenticated workspace members. Comments written on preview layouts are public and accessible to anyone, grouped inside public interaction boards.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <Database className="h-4 w-4 text-primary" />
          3. Base64 Upload Protection
        </h3>
        <p className="text-zinc-400 text-xs pl-5">
          Uploaded files (banners, workspace logos, submission attachments) are converted directly into secure base64 strings or media assets. Users retain full rights to delete attachments from our storage records.
        </p>
      </div>
    </div>
  );
}
