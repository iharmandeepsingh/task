import fetch from 'node:http';

// Check 1: What JS bundle is Vercel serving?
async function checkVercel() {
  const res = await globalThis.fetch('https://tasks-five-coral.vercel.app');
  const html = await res.text();
  const bundleMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  const bundle = bundleMatch ? bundleMatch[1] : 'NOT FOUND';
  console.log('Bundle served:', bundle);
  if (bundle.includes('BY-xg1z2')) {
    console.log('✅ Vercel IS serving LATEST build (208 faculty hardcoded)');
  } else {
    console.log('❌ Vercel is STILL serving OLD build - new commits NOT picked up');
  }

  // Check 2: Is the API reachable?
  console.log('\n--- Testing API endpoint ---');
  try {
    const apiRes = await globalThis.fetch('https://tasks-five-coral.vercel.app/api/sync-team');
    const text = await apiRes.text();
    console.log('HTTP status:', apiRes.status);
    console.log('Response (first 300 chars):', text.slice(0, 300));
    try {
      const json = JSON.parse(text);
      if (json.team && Array.isArray(json.team)) {
        console.log('✅ API WORKING - returned', json.team.length, 'team members');
      } else {
        console.log('⚠️  API responded but data unexpected:', JSON.stringify(json).slice(0, 200));
      }
    } catch(e) {
      console.log('❌ API returned HTML or non-JSON (NOT a serverless function)');
    }
  } catch(e) {
    console.log('❌ API fetch error:', e.message);
  }
}

checkVercel();
