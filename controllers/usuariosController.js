const usuarios = require("../models").Usuarios_model;
const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = {
  list(req, res) {
    return usuarios
      .findAll({})
      .then((usuarios) => res.status(200).send(usuarios))
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getById(req, res) {
    console.log(req.params.id);
    return usuarios
      .findByPk(req.params.id)
      .then((usuarios) => {
        console.log(usuarios);
        if (!usuarios) {
          return res.status(404).send({
            message: "usuarios Not Found",
          });
        }
        return res.status(200).send(usuarios);
      })
      .catch((error) => res.status(400).send(error));
  },


  createUsuario(req, res) {

    bcrypt.hash(req.body.password, saltRounds)
      .then(hashedPassword => {
        return usuarios.create({
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          cedula: req.body.cedula,
          email: req.body.email,
          password: hashedPassword,
          rol: req.body.rol
          // Guardar la password encriptada
        });
      })
      .then((usuarios) => res.status(201).send({ message: 'Usuario creado correctamente' }))
      .catch((error) => res.status(400).send(error));
  }
  ,

  updateUsuario(req, res) {
    return usuarios
      .findByPk(req.params.id)
      .then(async usuarios => {
        if (!usuarios) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        const updatedData = {
          nombre: req.body.nombre || usuarios.nombre,
          apellido: req.body.apellido || usuarios.apellido,
          cedula: req.body.cedula || usuarios.cedula,
          email: req.body.email || usuarios.email,
          password: req.body.hashedPassword || usuarios.hashedPassword,
          rol: req.body.rol || usuarios.rol
        };

        if (req.body.password) {
          updatedData.password = await bcrypt.hash(req.body.password, saltRounds);
        }

        return usuarios
          .update(updatedData)
          .then(() => res.status(200).send({ message: 'Usuario actualizado correctamente' }))
          .catch((error) => res.status(400).send(error));
      })
      .catch((error) => res.status(400).send(error));
  },


  deleteUsuario(req, res) {
    return usuarios
      .findByPk(req.params.id)
      .then(usuarios => {
        if (!usuarios) {
          return res.status(400).send({
            message: 'usuarios Not Found',
          });
        }
        return usuarios
        
          .destroy()
          .then(() => res.status(200).send({ message: 'Usuario eliminado correctamente' }))
          
          .catch((error) => res.status(400).send(error));
      })
      .catch((error) => res.status(400).send(error));
      
  },

};






