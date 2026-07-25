// Applies committed prisma/migrations/*/migration.sql files to a remote
// Turso/libSQL database in order, tracking applied state in a
// `_prisma_migrations` table (same shape Prisma's own migration engine uses).
//
// Why this exists: `prisma migrate deploy` cannot target Turso directly —
// libSQL's remote protocol isn't one Prisma's migration engine understands,
// only the `@prisma/adapter-libsql` *client* driver adapter does. So schema
// changes are applied here, by hand, via the same libSQL client the app uses.
//
// Usage:
//   DATABASE_URL="libsql://<db>.turso.io" TURSO_AUTH_TOKEN="<token>" node scripts/turso-migrate.mjs

import { createClient } from "@libsql/client";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !url.startsWith("libsql://")) {
  console.error(
    "Set DATABASE_URL to a libsql:// Turso URL before running this script."
  );
  process.exit(1);
}
if (!authToken) {
  console.error("Set TURSO_AUTH_TOKEN before running this script.");
  process.exit(1);
}

const client = createClient({ url, authToken });

const migrationsDir = join(__dirname, "..", "prisma", "migrations");
const migrationDirs = readdirSync(migrationsDir)
  .filter((entry) => statSync(join(migrationsDir, entry)).isDirectory())
  .sort();

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  for (const dir of migrationDirs) {
    const alreadyApplied = await client.execute({
      sql: `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = ?`,
      args: [dir],
    });
    if (alreadyApplied.rows.length > 0) {
      console.log(`skip (already applied): ${dir}`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, dir, "migration.sql"), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");

    console.log(`applying: ${dir}`);
    await client.executeMultiple(sql);

    await client.execute({
      sql: `INSERT INTO "_prisma_migrations"
              (id, checksum, finished_at, migration_name, applied_steps_count)
            VALUES (?, ?, datetime('now'), ?, 1)`,
      args: [randomUUID(), checksum, dir],
    });
    console.log(`applied: ${dir}`);
  }

  const tables = await client.execute(
    `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`
  );
  console.log(
    "tables now present:",
    tables.rows.map((r) => r.name).join(", ")
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => client.close());
