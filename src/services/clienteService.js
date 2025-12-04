import { pool } from "../db.js";

export const getClientes = async () => {
  const result = await pool.query("SELECT * FROM cliente ORDER BY id_cliente");
  return result.rows;
};

export const getCliente = async (id) => {
  const result = await pool.query(
    "SELECT * FROM cliente WHERE id_cliente = $1",
    [id]
  );
  return result.rows[0];
};

export const insertCliente = async (c) => {
  const sql = `
    INSERT INTO cliente (nome, cpf, telefone, email, endereco)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(sql, [
    c.nome,
    c.cpf,
    c.telefone,
    c.email,
    c.endereco
  ]);
  return result.rows[0];
};

export const updateCliente = async (id, c) => {
  const sql = `
    UPDATE cliente SET nome=$1, cpf=$2, telefone=$3, email=$4, endereco=$5
    WHERE id_cliente=$6 RETURNING *
  `;
  const result = await pool.query(sql, [
    c.nome,
    c.cpf,
    c.telefone,
    c.email,
    c.endereco,
    id
  ]);
  return result.rows[0];
};

export const removeCliente = async (id) => {
  await pool.query("DELETE FROM cliente WHERE id_cliente=$1", [id]);
};
