var express = require("express");
var router = express.Router();
const usuariosController =
  require("../controllers").usuariosController;

router.get("/", usuariosController.list);

router.get("/:id", usuariosController.getById);

router.post("/", usuariosController.createUsuario);

router.put("/:id", usuariosController.updateUsuario);

router.delete("/:id", usuariosController.deleteUsuario);

module.exports = router;