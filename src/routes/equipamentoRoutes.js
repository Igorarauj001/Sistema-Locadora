import { Router } from "express";
import {
  listarEquipamentos,
  buscarEquipamento,
  criarEquipamento,
  atualizarEquipamento,
  removerEquipamento
} from "../controllers/equipamentoController.js";

const router = Router();

router.get("/", listarEquipamentos);
router.get("/:id", buscarEquipamento);
router.post("/", criarEquipamento);
router.put("/:id", atualizarEquipamento);
router.delete("/:id", removerEquipamento);

export default router;
