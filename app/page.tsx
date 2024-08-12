import { auth } from "./auth";
import ClientHome from "./clientHome";

export default async function Home() {
  const session = await auth();

  return <ClientHome initialSession={session} />;
}