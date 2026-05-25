import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Sparkles, BarChart, Shield, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-8 overflow-hidden [background:radial-gradient(ellipse_60%_50%_at_50%_0%,#18181b,transparent),radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]">
      
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-2xs text-zinc-400">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span>About ChaiForm Suite</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          The Future of Form Engine
        </h1>
        <p className="text-zinc-450 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          ChaiForm is a streamlined platform designed to build, customize, and analyze form submissions. We enable organizations to construct responsive flows, evaluate conditional logic, and gather premium data points with full security.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md space-y-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-100">AI Assisted Creation</h3>
          <p className="text-2xs text-zinc-400 leading-relaxed">
            Construct forms in seconds by describing them in plain language. Our generator formats optimal field keys automatically.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md space-y-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <BarChart className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-100">Unified Analytics</h3>
          <p className="text-2xs text-zinc-400 leading-relaxed">
            Check logs, sort sub-details, and export full reports in CSV format to analyze trends and user patterns.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md space-y-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
            <Shield className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-100">Absolute Protection</h3>
          <p className="text-2xs text-zinc-400 leading-relaxed">
            Every submission is encrypted. Restrict access via unlisted paths or private workspace domains.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button className="rounded-xl h-10 px-5 gap-1.5 bg-primary hover:bg-primary/90 text-white">
            <span>Get Started</span>
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" className="rounded-xl h-10 px-5 gap-1.5 border-zinc-850 bg-zinc-900/40 text-white hover:bg-zinc-850">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
