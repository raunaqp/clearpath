import { getServiceClient } from "@/lib/supabase";

export async function downloadPdfAsBase64(storagePath: string): Promise<string> {
  const { data, error } = await getServiceClient()
    .storage.from("assessment-docs")
    .download(storagePath);

  if (error || !data) {
    throw new Error(
      `Failed to download PDF at "${storagePath}": ${error?.message ?? "no data returned"}`
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
