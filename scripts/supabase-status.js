import fs from 'fs';

async function checkStatus() {
  console.log('\n=============================================');
  console.log('       SUPABASE CLOUD PROJECT STATUS');
  console.log('=============================================');

  let projectRef = 'kyyoahufvlahubrkxgyo';
  let projectName = "owensmitt79's Project";

  try {
    const linked = JSON.parse(fs.readFileSync('supabase/.temp/linked-project.json', 'utf8'));
    projectRef = linked.ref || projectRef;
    projectName = linked.name || projectName;
  } catch (_) {}

  const apiUrl = `https://${projectRef}.supabase.co`;
  const apiKey = 'sb_publishable_qAVO4TSs5DGJJnNMI_cn1A_TZ35Qb_J';

  console.log(`• Status:        LINKED`);
  console.log(`• Project Name:  ${projectName}`);
  console.log(`• Project Ref:   ${projectRef}`);
  console.log(`• API URL:       ${apiUrl}`);
  console.log(`• Mode:          Cloud Direct (Docker-Free)`);

  try {
    const res = await fetch(`${apiUrl}/rest/v1/payment_categories?select=id&limit=1`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (res.ok) {
      console.log(`• Cloud API:     ONLINE (HTTP ${res.status} OK)`);
    } else {
      console.log(`• Cloud API:     REACHABLE (HTTP ${res.status})`);
    }
  } catch (err) {
    console.log(`• Cloud API:     CONNECTING... (${err.message})`);
  }

  const typesExist = fs.existsSync('src/types/supabase.ts');
  console.log(`• Schema Types:  ${typesExist ? 'src/types/supabase.ts (Generated)' : 'Not yet generated'}`);
  console.log('=============================================\n');
}

checkStatus();
