// Runs automatically as part of the Vercel build (see the "build" script in
// package.json) so a schema change can never again ship to production
// without its migration being applied to Turso — the exact incident this
// guards against: a migration committed and deployed, but never run against
// the remote database, breaking every page that touches the changed table.
//
// Locally, DATABASE_URL points at the on-disk dev.db (not a libsql:// URL),
// so this is a no-op there — `npm run build` behaves exactly as before.
// See scripts/turso-migrate.mjs for the actual migration-application logic
// and why `prisma migrate deploy` can't be used against Turso directly.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.DATABASE_URL ?? "";

if (!url.startsWith("libsql://")) {
  console.log(
    "[turso-migrate] DATABASE_URL is not a libsql:// URL — skipping (local/non-Turso build)."
  );
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const result = spawnSync(process.execPath, [join(__dirname, "turso-migrate.mjs")], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
