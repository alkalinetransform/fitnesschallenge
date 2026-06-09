import { CheckInResult } from "@/components/check-in-result";
import { searchParamsToCheckInResult } from "@/lib/check-in-core";

export const dynamic = "force-dynamic";

export default async function CheckInResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const result = searchParamsToCheckInResult(params);
  return <CheckInResult result={result} />;
}
