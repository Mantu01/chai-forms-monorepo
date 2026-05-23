import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">About ChaiForm</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          ChaiForm is a streamlined platform designed to collect, process, and forward form submissions. Built with modern web architecture to provide developers and users with instant feedback, robust verification, and simple workspace management.
        </p>
        <Link href="/profile" className="inline-block mt-4">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>
    </div>
  );
}
