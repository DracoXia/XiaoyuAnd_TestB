import { readFile } from 'node:fs/promises';

const siteUrl = process.env.URL || process.env.DEPLOY_URL;
const adminKey = process.env.PUSH_ADMIN_KEY;
if (!siteUrl || !adminKey) throw new Error('URL/DEPLOY_URL and PUSH_ADMIN_KEY are required');

const updates = JSON.parse(await readFile(new URL('../public/updates.json', import.meta.url), 'utf8'));
const latest = [...updates].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/push/publish-update`, {
  method: 'POST',
  headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
  body: JSON.stringify(latest),
});
if (!response.ok) throw new Error(`publish failed: ${response.status} ${await response.text()}`);
console.log(`Published update ${latest.id}`);
