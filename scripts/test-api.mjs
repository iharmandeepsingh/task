async function testAPI() {
  const url = 'https://tasks-five-coral.vercel.app/api/sync-team';
  console.log('Testing:', url);
  const r = await fetch(url);
  console.log('HTTP Status:', r.status);
  const text = await r.text();
  console.log('Raw response (first 500):', text.slice(0, 500));
  try {
    const json = JSON.parse(text);
    if (json.team && Array.isArray(json.team)) {
      console.log('\n✅ API IS WORKING!');
      console.log('Members in MongoDB:', json.team.length);
      const cats = {};
      json.team.forEach(m => { const c = m.category || 'UNKNOWN'; cats[c] = (cats[c]||0)+1; });
      console.log('Category breakdown:', JSON.stringify(cats));
    } else {
      console.log('\n⚠️  API returned JSON but unexpected shape:', JSON.stringify(json).slice(0, 300));
    }
  } catch(e) {
    console.log('\n❌ Response is NOT valid JSON');
  }
}
testAPI().catch(e => console.log('Error:', e.message));
