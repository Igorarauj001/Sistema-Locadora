import { Router } from "express";
import {
  listarLocacoes,
  buscarLocacao,
  criarLocacao,
  adicionarItem,
  gerarParcelas,
  obterTotalLocacao,
  fecharLocacao
} from "../controllers/locacaoController.js";

const router = Router();

// Deve vir antes de /:id
router.get("/:id/total", obterTotalLocacao);

// CRUD básico
router.get("/", listarLocacoes);
router.get("/:id", buscarLocacao);
router.post("/", criarLocacao);

// Itens
router.post("/item", adicionarItem);

// Parcelas via procedure
router.post("/parcelas", gerarParcelas);

// Encerrar locação
router.put("/fechar/:id_locacao", fecharLocacao);

export default router;
