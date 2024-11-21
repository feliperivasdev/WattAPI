var express = require("express");
var router = express.Router();
const consumoController =
  require("../controllers").consumoController;

router.get("/", consumoController.list);

router.get("/:id", consumoController.getById);

router.get("/usuarios/:id", consumoController.getConsumoByUserId);

router.post("/", consumoController.createConsumo);

router.post("/predict", consumoController.predictConsumo);

router.post("/predict/usuarios/:id", consumoController.predictConsumoByUserId)

router.put("/:id", consumoController.updateConsumo);

router.delete("/:id", consumoController.deleteConsumo);

module.exports = router;

