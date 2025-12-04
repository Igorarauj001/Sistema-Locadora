import { pool } from "./src/db.js";

async function testarEstrutura() {
  console.log("🔍 VERIFICANDO ESTRUTURA DO BANCO...\n");

  const tabelas = [
    "cliente",
    "categoria",
    "equipamento",
    "locacao",
    "item_locacao",
    "parcela"
  ];

  for (const tabela of tabelas) {
    const { rowCount } = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = '${tabela}'`
    );

    if (rowCount === 0) {
      console.log(`❌ Tabela ausente: ${tabela}`);
      continue;
    } else {
      console.log(`✔️ Tabela encontrada: ${tabela}`);
    }

    const { rows } = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${tabela}'
    `);

    console.log(`📊 Colunas de ${tabela}:`);
    rows.forEach(col => console.log("   -", col.column_name));
    console.log("");
  }

  console.log("🎯 Estrutura validada com sucesso!");
  await pool.end();
}

testarEstrutura();
