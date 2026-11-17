// Release operations use Git Credential Manager in memory, never command-line tokens.
import { spawnSync } from 'node:child_process';
export const repository = 'Gustavo-Abreu-Ribeiro/lista-compras';
const credential = spawnSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
const password = credential.stdout.split('\n').find(line => line.startsWith('password='))?.slice(9).trim();
if (!password) throw new Error('GitHub credential unavailable');
export const headers = { Authorization: `Bearer ${password}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
export async function api(path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${result.message}`);
  return result;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/release/github.mjs')) {
  const command = process.argv[2];
  if (command === 'status') {
    const [secrets, releases, tags] = await Promise.all([api('/actions/secrets'), api('/releases'), api('/tags')]);
    console.log(JSON.stringify({ secrets: secrets.secrets.map(item => item.name), releases: releases.map(item => ({ tag: item.tag_name, draft: item.draft, assets: item.assets.map(asset => asset.name) })), tags: tags.map(item => item.name) }));
  } else if (command === 'runs') {
    const runs = await api('/actions/workflows/release.yml/runs?per_page=3');
    for (const run of runs.workflow_runs) {
      const jobs = await api(`/actions/runs/${run.id}/jobs`);
      console.log(JSON.stringify({ id: run.id, sha: run.head_sha, status: run.status, conclusion: run.conclusion, jobs: jobs.jobs.map(job => ({ id: job.id, name: job.name, status: job.status, conclusion: job.conclusion, steps: job.steps.filter(step => step.status === 'in_progress' || step.conclusion === 'failure').map(step => ({ name: step.name, status: step.status, conclusion: step.conclusion })) })) }));
    }
  } else if (command === 'dispatch') {
    await api('/actions/workflows/release.yml/dispatches', 'POST', { ref: process.argv[3] || 'main' });
    console.log('Release workflow dispatched');
  } else if (command === 'rerun') {
    await api(`/actions/runs/${process.argv[3]}/rerun-failed-jobs`, 'POST');
    console.log('Failed jobs queued');
  } else if (command === 'cancel') {
    await api(`/actions/runs/${process.argv[3]}/cancel`, 'POST');
    console.log('Obsolete workflow cancelled');
  } else if (command === 'logs') {
    const response = await fetch(`https://api.github.com/repos/${repository}/actions/jobs/${process.argv[3]}/logs`, { headers });
    if (!response.ok) throw new Error(`Logs ${response.status}`);
    const lines = (await response.text()).split('\n');
    console.log(lines.slice(-Number(process.argv[4] || 100)).join('\n'));
  } else { throw new Error('Use status, runs, dispatch, rerun, logs'); }
}
