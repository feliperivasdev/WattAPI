const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuario = require("../models").Usuarios_model;

// Cargar la clave secreta desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

function generarToken(usuario) {
  const data = {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    cedula: usuario.cedula,
    email: usuario.email,
    rol: usuario.rol,
    id: usuario.id,
  };
  return jwt.sign(data, JWT_SECRET, { expiresIn: "1h" });
}

module.exports = {
  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Correo y contraseña son necesarios" });
    }

    try {
      const usuarioEncontrado = await usuario.findOne({
        where: {
          email,
        },
      });

      if (!usuarioEncontrado) {
        return res.status(404).send({ message: "Usuario no encontrado" });
      }

      // Comparar contraseña
      const passwordMatch = await bcrypt.compare(password, usuarioEncontrado.password);
      if (!passwordMatch) {
        return res.status(401).send({ message: "Credenciales incorrectas" });
      }

      // Generar token
      const token = generarToken(usuarioEncontrado);
      return res.status(200).send({
        token,
        nombre: usuarioEncontrado.nombre,
        apellido: usuarioEncontrado.apellido,
        cedula: usuarioEncontrado.cedula,
        email: usuarioEncontrado.email,
        rol: usuarioEncontrado.rol,
        id: usuarioEncontrado.id,
      });
    } catch (error) {
      return res.status(500).send({ message: "Error interno del servidor" });
    }
  },
};
