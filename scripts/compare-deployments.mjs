// Also check the brand new staging URL from the latest deploy
const urls = [
  'https://tasks-five-coral-rltcujzoh-iharmandeepsinghs-projects.vercel.app',
  'https://tasks-five-coral.vercel.app',
];

async function checkUrl(url) {
  console.log(`\nChecking: ${url}`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    const bundleMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    const bundle = bundleMatch ? bundleMatch[1] : 'NOT FOUND';
    console.log('  Bundle:', bundle);
    console.log('  Is latest build:', bundle.includes('BY-xg1z2') ? '✅ YES' : '❌ NO');

    const apiRes = await fetch(`${url}/api/sync-team`);
    const text = await apiRes.text();
    console.log('  API status:', apiRes.status);
    try {
      const json = JSON.parse(text);
      if (json.team) {
        console.log('  API: ✅ Working -', json.team.length, 'team members');
      } else {
        console.log('  API JSON:', JSON.stringify(json).slice(0, 150));
      }
    } catch(e) {
      console.log('  API: ❌ Not JSON -', text.slice(0, 80));
    }
  } catch(e) {
    console.log('  Error:', e.message);
  }
}

(async () => { for (const u of urls) await checkUrl(u); })();
