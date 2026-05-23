import { getApi } from "~/trpc/server";

export default async function AuthPage() {
  const api = await getApi();
  const providers = await api.auth.getSupportedAuthenticationProviders.query();
  const googleProvider = providers.find((p) => p.provider === "GOOGLE_OAUTH");
  if (!googleProvider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-red-500 font-medium">Google Auth is not configured on the backend.</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <a
          href={googleProvider.authUrl}
          className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors duration-200"
        >
          Continue with Google
        </a>
      </div>
    </div>
  );
}
