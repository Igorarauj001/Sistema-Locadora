import { pool } from "./src/db.js";

async function testarFuncoes() {
  console.log("\n🧪 TESTANDO FUNÇÕES...");

  const funcoes = [
    "fn_calcular_total",
    "fn_calcular_multa",
    "fn_dias_atraso",
    "fn_todas_parcelas_pagas"
  ];

  for (const fn of funcoes) {
    const { rowCount } = await pool.query(
      `SELECT proname FROM pg_proc WHERE proname = '${fn}'`
    );

    if (rowCount > 0) console.log(`✔️ ${fn} encontrada`);
    else console.log(`❌ ${fn} NÃO encontrada`);
  }

  console.log("\n🧪 Teste prático:");
  const { rows } = await pool.query("SELECT fn_calcular_total(1) AS total");
  console.log("Total da locação 1:", rows[0].total);

  await pool.end();
  console.log("🔚 Conexão encerrada");
}

testarFuncoes();
