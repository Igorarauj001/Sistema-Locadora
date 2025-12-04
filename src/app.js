import express from "express";
import clienteRoutes from "./routes/clienteRoutes.js";
import locacaoRoutes from "./routes/locacaoRoutes.js";
import parcelaRoutes from "./routes/parcelaRoutes.js";
import equipamentoRoutes from "./routes/equipamentoRoutes.js";

const app = express();
app.use(express.json());

app.use("/clientes", clienteRoutes);
app.use("/locacoes", locacaoRoutes);
app.use("/parcelas", parcelaRoutes);
app.use("/equipamentos", equipamentoRoutes);

app.listen(3333, () => {
  console.log("Servidor rodando na porta 3333");
});
