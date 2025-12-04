import { Router } from "express";
import {
  listarParcelas,
  pagarParcela,
  parcelasDaLocacao
} from "../controllers/parcelaController.js";

const router = Router();

router.get("/", listarParcelas);
router.get("/locacao/:id_locacao", parcelasDaLocacao);
router.post("/pagar", pagarParcela);

export default router;
