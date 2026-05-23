import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-zinc-400 text-xs leading-relaxed text-justify">
          Your privacy is important to us. We collect submission data solely to deliver, store, and process answers on behalf of our users. We do not sell, distribute, or share personal information with third parties. All communication is transmitted securely.
        </p>
        <Link href="/profile" className="inline-block mt-4">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>
    </div>
  );
}
