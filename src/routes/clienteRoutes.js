import { Router } from "express";
import {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  removerCliente,
} from "../controllers/clienteController.js";

const router = Router();

// lista todos
router.get("/", listarClientes);

// detalhe por id
router.get("/:id", buscarCliente);

// cria
router.post("/", criarCliente);

// atualiza
router.put("/:id", atualizarCliente);

// deleta
router.delete("/:id", removerCliente);

export default router;
