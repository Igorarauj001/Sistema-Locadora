import { pool } from "../db.js";

export const listarClientes = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM cliente ORDER BY id_cliente");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const buscarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM cliente WHERE id_cliente = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Cliente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const criarCliente = async (req, res) => {
  try {
    const { nome, cpf, telefone, email, endereco } = req.body;

    if (!nome || !cpf) {
      return res.status(400).json({ erro: "Nome e CPF são obrigatórios" });
    }

    const sql = `
      INSERT INTO cliente (nome, cpf, telefone, email, endereco)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, [
      nome,
      cpf,
      telefone || null,
      email || null,
      endereco || null,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    // se tiver UNIQUE(cpf)
    if (err.code === "23505") {
      return res.status(400).json({ erro: "CPF já cadastrado" });
    }
    res.status(500).json({ erro: err.message });
  }
};

export const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, endereco } = req.body;

    const sql = `
      UPDATE cliente
      SET nome = $1,
          telefone = $2,
          email = $3,
          endereco = $4
      WHERE id_cliente = $5
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, [
      nome,
      telefone || null,
      email || null,
      endereco || null,
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Cliente não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const removerCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // opcional: impedir exclusão com locação ativa
    const locacoes = await pool.query(
      "SELECT 1 FROM locacao WHERE id_cliente = $1 AND status = 'Ativa'",
      [id]
    );

    if (locacoes.rowCount > 0) {
      return res.status(400).json({
        erro: "Não é possível excluir cliente com locação ativa",
      });
    }

    const { rowCount } = await pool.query(
      "DELETE FROM cliente WHERE id_cliente = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Cliente não encontrado" });
    }

    res.json({ mensagem: "Cliente removido com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
