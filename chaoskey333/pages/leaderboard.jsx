import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Leaderboard</h1>
      <ul>
        {data.map((entry, i) => (
          <li key={i}>{entry.wallet} — {entry.relics} relics — ${entry.spent}</li>
        ))}
      </ul>
    </div>
  );
}