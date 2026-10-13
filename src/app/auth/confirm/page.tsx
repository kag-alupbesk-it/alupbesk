import { EmailConfirmation } from "@/frontend/auth/EmailConfirmation";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;
  return <EmailConfirmation tokenHash={params.token_hash ?? ""} type={params.type ?? ""} />;
}
