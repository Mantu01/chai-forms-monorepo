import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          If you have any questions, suggestions, or concerns regarding ChaiForm, feel free to reach out to our team at:
        </p>
        <p className="text-white font-semibold text-lg font-mono">support@chaiform.io</p>
        <Link href="/profile" className="inline-block mt-4">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>
    </div>
  );
}
