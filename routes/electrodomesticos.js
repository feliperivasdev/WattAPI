var express = require("express");
var router = express.Router();
const electrodomesticosController =
  require("../controllers").electrodomesticosController;

router.get("/", electrodomesticosController.list);

router.get("/:id", electrodomesticosController.getById);

router.get("/usuarios/:id", electrodomesticosController.getElectrodomesticoByUserId);

router.post("/", electrodomesticosController.createElectrodomestico);

router.put("/:id", electrodomesticosController.updateElectrodomestico);

router.delete("/:id", electrodomesticosController.deleteElectrodomestico);

module.exports = router;
