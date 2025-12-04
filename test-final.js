import { pool } from "./src/db.js";

async function testFinal() {
  console.log("\n🏁 TESTE FINAL - LOCAÇÃO COMPLETA\n");

  // Dias de atraso
  const atraso = await pool.query("SELECT fn_dias_atraso(1)");
  console.log("Dias de atraso:", atraso.rows[0].fn_dias_atraso);

  // Multa
  const multa = await pool.query("SELECT fn_calcular_multa(1)");
  console.log("Multa calculada:", multa.rows[0].fn_calcular_multa);

  // Parcelas
  const parcelas = await pool.query("SELECT * FROM parcela WHERE id_locacao = 1");
  console.log("Parcelas geradas:", parcelas.rowCount);

  await pool.end();
  console.log("\n🎉 TESTE FINAL CONCLUÍDO COM SUCESSO\n");
}

testFinal();
