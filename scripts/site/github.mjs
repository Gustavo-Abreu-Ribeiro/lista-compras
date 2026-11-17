// Git Credential Manager supplies authorization in memory. Never prints credentials.
import { spawnSync } from "node:child_process";
const credential = spawnSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
});
const fields = Object.fromEntries(
  credential.stdout
    .trim()
    .split("\n")
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);
if (!fields.password) {
  console.error(
    "GitHub credential unavailable. Authenticate with Git Credential Manager.",
  );
  process.exit(1);
}
const command = process.argv[2] || "status";
const root = "https://api.github.com/repos/Gustavo-Abreu-Ribeiro/lista-compras";
const headers = {
  Authorization: `Bearer ${fields.password}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};
async function request(path, method = "GET", body) {
  const response = await fetch(root + path, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};
  if (!response.ok) {
    console.error(
      JSON.stringify({ status: response.status, message: result.message }),
    );
    process.exit(1);
  }
  return result;
}
if (command === "status") {
  const repo = await request("");
  console.log(
    JSON.stringify({
      permissions: repo.permissions,
      has_pages: repo.has_pages,
    }),
  );
} else if (command === "enable") {
  const result = await request("/pages", "POST", { build_type: "workflow" });
  console.log(
    JSON.stringify({
      html_url: result.html_url,
      build_type: result.build_type,
    }),
  );
} else if (command === "runs") {
  const runs = await request("/actions/workflows/pages.yml/runs?per_page=1");
  console.log(
    JSON.stringify(
      runs.workflow_runs.map((run) => ({
        id: run.id,
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
      })),
    ),
  );
} else if (command === "pages") {
  const page = await request("/pages");
  console.log(
    JSON.stringify({
      url: page.html_url,
      status: page.status,
      build_type: page.build_type,
    }),
  );
} else {
  throw new Error("Unknown command");
}
