import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-zinc-400 text-xs leading-relaxed text-justify">
          By using ChaiForm, you agree to submit only accurate information and refrain from submitting malicious code or scripts. We reserve the right to remove forms or submissions that violate applicable guidelines or represent spam activity.
        </p>
        <Link href="/profile" className="inline-block mt-4">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>
    </div>
  );
}
