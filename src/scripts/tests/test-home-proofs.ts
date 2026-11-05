import { homeProofs } from "../../config/home-proofs.ts";

for (const locale of ["fr", "en"] as const) {
  const proofs = homeProofs[locale];

  if (proofs.length !== 3) {
    throw new Error(`home proofs: expected exactly 3 items for ${locale}, got ${proofs.length}`);
  }

  for (const proof of proofs) {
    if (!proof.value.trim() || !proof.label.trim() || !proof.body.trim()) {
      throw new Error(`home proofs: incomplete proof for ${locale}`);
    }
    if (!proof.href.startsWith(locale === "en" ? "/en/thinking/" : "/thinking/")) {
      throw new Error(`home proofs: proof must link to a public Thinking source: ${proof.href}`);
    }
  }
}

console.log("Home proof contract OK");
