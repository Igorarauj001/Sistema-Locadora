import { pool } from "../db.js";

export const listarParcelas = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM parcela ORDER BY id_parcela");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const pagarParcela = async (req, res) => {
  try {
    const { id, valor_pago } = req.body;

    if (!id || !valor_pago)
      return res.status(400).json({ erro: "Informe id e valor_pago" });

    await pool.query("CALL prc_pagar_parcela($1, $2)", [id, valor_pago]);

    res.json({ mensagem: "Parcela paga com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const parcelasDaLocacao = async (req, res) => {
  try {
    const { id_locacao } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM parcela WHERE id_locacao = $1 ORDER BY id_parcela",
      [id_locacao]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
