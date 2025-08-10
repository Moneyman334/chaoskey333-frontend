export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
  return res.status(200).json({ ok: true, service: "ChaosKey333 Ascension", time: new Date().toISOString() });
}