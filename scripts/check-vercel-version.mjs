// Check what JS bundle Vercel is currently serving
fetch('https://tasks-five-coral.vercel.app')
  .then(r => r.text())
  .then(t => {
    const m = t.match(/src="(\/assets\/index-[^"]+\.js)"/);
    const jsFile = m ? m[1] : 'not found';
    console.log('Vercel is serving JS bundle:', jsFile);
    
    // Our latest build generated: index-BY-xg1z2.js
    const expected = 'index-BY-xg1z2.js';
    if (jsFile.includes(expected)) {
      console.log('✅ Vercel IS serving the LATEST build with 208 faculty members!');
    } else {
      console.log('❌ Vercel is serving an OLD build. You must redeploy on Vercel!');
      console.log('Expected bundle containing:', expected);
    }
  })
  .catch(e => console.log('Error:', e.message));
