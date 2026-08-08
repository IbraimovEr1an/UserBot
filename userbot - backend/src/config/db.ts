import { Pool, type QueryResult, type QueryResultRow } from "pg";

const processENV = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const key of processENV) {
  if (!process.env[key]) {
    throw new Error(`(db.ts) env mavjud emas - ${key} mavjud emas`);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  min: 2,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("PostgeSQL: Kutilmagan xatolik yuz berdi - ", err.message);
});

pool.on("connect", () => {
  console.log("PostgeSQL: Ulanish ornatilmoqda...");
});

export const chechConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("PostgeSQL: Ulandi");
  } catch (err) {
    console.error("PostgeSQL: Ulanishda xatolik - ", (err as Error).message);
    throw err;
  }
};

export const db = async <T extends QueryResultRow = any>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> => {
  try {
    const res = await pool.query<T>(sql, params);
    return res;
  } catch (err) {
    throw new Error(`(db.ts) - query xatosi - ${(err as Error).message}`);
  }
};

export const closeDB = async (): Promise<void> => {
  await pool.end();
  console.log("PostgeSQL: Yopildi");
};
