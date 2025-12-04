import { pool } from "../db.js";

export const getLocacoes = async () => {
  const result = await pool.query("SELECT * FROM locacao ORDER BY id_locacao");
  return result.rows;
};

export const getLocacao = async (id) => {
  const result = await pool.query(
    "SELECT * FROM locacao WHERE id_locacao=$1",
    [id]
  );
  return result.rows[0];
};

export const insertLocacao = async (l) => {
  const sql = `
    INSERT INTO locacao (id_cliente, data_locacao, data_prevista, status)
    VALUES ($1, $2, $3, 'Aberta')
    RETURNING *
  `;
  const result = await pool.query(sql, [
    l.id_cliente,
    l.data_locacao,
    l.data_prevista
  ]);
  return result.rows[0];
};

export const updateLocacao = async (id, l) => {
  const sql = `
    UPDATE locacao
    SET data_prevista=$1, status=$2
    WHERE id_locacao=$3
    RETURNING *
  `;
  const result = await pool.query(sql, [
    l.data_prevista,
    l.status,
    id
  ]);
  return result.rows[0];
};

export const removeLocacao = async (id) => {
  await pool.query("DELETE FROM locacao WHERE id_locacao=$1", [id]);
};

// chama FUNCTION - COM CAST EXPLÍCITO
export const fnCalcularTotal = async (id) => {
  const sql = "SELECT fn_calcular_total($1::integer) AS total";
  const result = await pool.query(sql, [Number(id)]);
  return result.rows[0];
};

// chama PROCEDURE - COM CAST EXPLÍCITO e versão específica
export const prcGerarParcelas = async (id, parcelas) => {
  // Versão com 2 parâmetros: (integer, integer)
  const sql = "CALL prc_gerar_parcelas($1::integer, $2::integer)";
  await pool.query(sql, [Number(id), Number(parcelas)]);
};