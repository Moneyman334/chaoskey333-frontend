(() => {
  const STATS_URL = '../data/ai-stats.json';
  const FEED_URL  = '../data/ai-feed.json';
  const el = (id) => document.getElementById(id);
  function fmtUsd(n){ if(n==null) return '—';
    const s = n>=0?'':'-'; return s+Math.abs(n).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:2}); }
  function sparkline(canvas, pts){
    if(!canvas||!pts||!pts.length) return;
    const ctx=canvas.getContext('2d'); const w=canvas.width=canvas.clientWidth||280; const h=canvas.height;
    const pad=4, min=Math.min(...pts), max=Math.max(...pts);
    ctx.clearRect(0,0,w,h); ctx.lineWidth=2; ctx.strokeStyle='#24f3b5'; ctx.beginPath();
    pts.forEach((v,i)=>{ const x=pad+(w-2*pad)*(i/(pts.length-1));
      const y=h-pad-((v-min)/(max-min||1))*(h-2*pad); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();
  }
  function renderStats(s){
    const {pnl_24h,win_rate_24h,streak,equity_curve}=s||{};
    const k1=el('kpi-pnl24h'),k2=el('kpi-winrate'),k3=el('kpi-streak');
    if(k1){ k1.textContent=`24h P&L: ${fmtUsd(pnl_24h)}`; k1.classList.toggle('green',pnl_24h>0); k1.classList.toggle('red',pnl_24h<0); }
    if(k2) k2.textContent=`Win-rate: ${win_rate_24h!=null?win_rate_24h.toFixed(1)+'%':'—'}`;
    if(k3) k3.textContent=`Streak: ${streak??'—'}`;
    sparkline(el('equity-spark'),equity_curve);
  }
  function tradeCard(t){
    const pnlClass=t.pnl>=0?'pos':'neg';
    const badge=t.status==='OPEN'?'open':'closed';
    const pnlTxt=`${t.pnl>=0?'+':''}${fmtUsd(t.pnl??0)} (${(t.pnl_pct??0).toFixed(2)}%)`;
    return `<div class="trade-card">
      <div class="row"><span class="pair">${t.pair||'—'}</span><span class="badge ${badge}">${t.status||'—'}</span></div>
      <div class="row"><span class="muted">${t.side||'—'}</span><span class="muted">${t.ts?new Date(t.ts).toLocaleTimeString():'—'}</span></div>
      <div class="row"><span class="muted">Entry</span><span>${t.entry ?? '—'}</span></div>
      <div class="row"><span class="muted">Exit</span><span>${t.exit ?? '—'}</span></div>
      <div class="row"><span class="pnl ${pnlClass}">${pnlTxt}</span></div>
    </div>`;
  }
  async function tick(){
    try{
      const [sr,fr]=await Promise.all([fetch(STATS_URL,{cache:'no-store'}),fetch(FEED_URL,{cache:'no-store'})]);
      const stats=await sr.json().catch(()=>null); const feed=await fr.json().catch(()=>null);
      if(stats) renderStats(stats);
      const openWrap=document.getElementById('open-positions'); const recentWrap=document.getElementById('recent-trades');
      if(feed){
        const open=(feed.trades||[]).filter(t=>t.status==='OPEN');
        const closed=(feed.trades||[]).filter(t=>t.status==='CLOSED').slice(0,10);
        if(openWrap) openWrap.innerHTML=open.length?open.map(tradeCard).join(''):'';
        if(recentWrap) recentWrap.innerHTML=closed.length?closed.map(tradeCard).join(''):'<div class="muted">No recent trades</div>';
      }
    }catch(e){ console.warn('AI feed update failed',e); }
  }
  tick(); setInterval(tick,60000);
})();