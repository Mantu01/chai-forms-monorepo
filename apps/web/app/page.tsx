import { redirect } from "next/navigation";
import { getApi } from "~/trpc/server";

export default async function Home() {
  const api = await getApi();
  const { user } = await api.auth.me.query();
  if (user) {
    redirect("/profile");
  } else {
    redirect("/auth");
  }
}
