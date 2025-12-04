import { pool } from "../db.js";

export const listarEquipamentos = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM equipamento ORDER BY id_equipamento");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const buscarEquipamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM equipamento WHERE id_equipamento = $1", [id]);

    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Equipamento não encontrado" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const criarEquipamento = async (req, res) => {
  try {
    const { id_categoria, nome, valor_diaria, disponivel } = req.body;

    const sql = `
      INSERT INTO equipamento (id_categoria, nome, valor_diaria, disponivel)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, [id_categoria, nome, valor_diaria, disponivel]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const atualizarEquipamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, valor_diaria, disponivel } = req.body;

    const sql = `
      UPDATE equipamento
      SET nome = $1, valor_diaria = $2, disponivel = $3
      WHERE id_equipamento = $4
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, [nome, valor_diaria, disponivel, id]);

    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Equipamento não encontrado" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const removerEquipamento = async (req, res) => {
  try {
    const { id } = req.params;

    const { rowCount } = await pool.query("DELETE FROM equipamento WHERE id_equipamento = $1", [id]);

    if (rowCount === 0)
      return res.status(404).json({ mensagem: "Equipamento não encontrado" });

    res.json({ mensagem: "Equipamento removido com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
