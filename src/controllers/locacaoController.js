import {
  getLocacoes,
  getLocacao,
  insertLocacao,
  updateLocacao,
  removeLocacao,
  fnCalcularTotal,
  prcGerarParcelas
} from "../services/locacaoService.js";

import { pool } from "../db.js";

// LISTAR TODAS AS LOCAÇÕES
export const listarLocacoes = async (req, res) => {
  res.json(await getLocacoes());
};

// BUSCAR POR ID
export const buscarLocacao = async (req, res) => {
  const loc = await getLocacao(req.params.id);
  if (!loc) return res.status(404).json({ error: "Locação não encontrada" });
  res.json(loc);
};

// CRIAR LOCAÇÃO
export const criarLocacao = async (req, res) => {
  res.json(await insertLocacao(req.body));
};

// ATUALIZAR
export const atualizarLocacao = async (req, res) => {
  res.json(await updateLocacao(req.params.id, req.body));
};

// DELETAR
export const deletarLocacao = async (req, res) => {
  await removeLocacao(req.params.id);
  res.json({ msg: "Locação excluída" });
};

// FUNÇÃO → chama fn_calcular_total (REQUISITO)
export const obterTotalLocacao = async (req, res) => {
  try {
    const total = await fnCalcularTotal(req.params.id);
    res.json({ id_locacao: req.params.id, total });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// PROCEDURE → chama prc_gerar_parcelas
export const gerarParcelas = async (req, res) => {
  const { parcelas } = req.body;
  await prcGerarParcelas(req.params.id, parcelas);
  res.json({ msg: "Parcelas geradas" });
};

// ADICIONAR ITEM À LOCAÇÃO
export const adicionarItem = async (req, res) => {
  try {
    const { id_locacao, id_equipamento, quantidade } = req.body;

    if (!id_locacao || !id_equipamento || !quantidade)
      return res.status(400).json({ erro: "Informe id_locacao, id_equipamento e quantidade" });

    const sql = `
      INSERT INTO item_locacao (id_locacao, id_equipamento, quantidade)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, [
      id_locacao,
      id_equipamento,
      quantidade
    ]);

    res.status(201).json({
      mensagem: "Item adicionado à locação com sucesso!",
      item: rows[0]
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
export const fecharLocacao = async (req, res) => {
  try {
    const { id_locacao } = req.params;

    if (!id_locacao) {
      return res.status(400).json({ erro: "Informe o id da locação" });
    }

    // Chama a procedure do banco
    await pool.query("CALL prc_fechar_locacao($1)", [id_locacao]);

    res.json({ mensagem: "Locação encerrada com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
