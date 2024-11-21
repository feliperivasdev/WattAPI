const express = require("express");
const router = express.Router();
const reporteController = require("../controllers").reporteController;

router.get("/", reporteController.list);

router.get("/:id", reporteController.getById);

router.get("/usuarios/:id", reporteController.getReporteByUserId);

router.post("/", reporteController.createReporte);

router.put("/:id", reporteController.updateReporte);

router.delete("/:id", reporteController.deleteReporte);

module.exports = router;
