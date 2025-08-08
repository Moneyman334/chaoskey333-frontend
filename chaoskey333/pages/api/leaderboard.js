let leaderboard = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(leaderboard);
  }
  if (req.method === 'POST') {
    const { wallet, relics, spent } = req.body;
    leaderboard.push({ wallet, relics, spent });
    return res.status(201).json({ success: true });
  }
  res.status(405).end('Method Not Allowed');
}