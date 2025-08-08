import { useState } from 'react';

export default function Admin() {
  const [token, setToken] = useState('');
  const [price, setPrice] = useState('');

  const savePrice = async () => {
    if (token !== process.env.NEXT_PUBLIC_TEMP_ADMIN_TOKEN) {
      alert('Invalid Token');
      return;
    }
    alert(`✅ Price saved: $${price}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>
      <input placeholder="Admin Token" value={token} onChange={e => setToken(e.target.value)} />
      <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <button onClick={savePrice}>Save Price</button>
    </div>
  );
}