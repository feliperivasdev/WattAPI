const { where } = require("sequelize");

const consumo = require("../models").Registro_consumo_model;
const electrodomesticos = require("../models").Electrodomesticos_model;
const mlReg = require('ml-regression-simple-linear').SimpleLinearRegression;

module.exports = {
  list(req, res) {
    return consumo
      .findAll({})
      .then((consumo) => res.status(200).send(consumo))
      .catch((error) => {
        res.status(400).send(error);
      });
  },
  getById(req, res) {
    console.log(req.params.id);
    return consumo
      .findByPk(req.params.id)
      .then((consumo) => {
        console.log(consumo);
        if (!consumo) {
          return res.status(404).send({
            message: "consumo Not Found",
          });
        }
        return res.status(200).send(consumo);
      })
      .catch((error) => res.status(400).send(error));
  },

  getConsumoByUserId(req, res) {
    const id_usuario = req.params.id;

    return electrodomesticos.findAll({
      where: {
        id_usuario
      },
      include: [{
        model: consumo,
        as: 'consumo',
        required: true
      }]
    })
      .then((electrodomesticos) => {
        if (!electrodomesticos || electrodomesticos.length === 0) {
          return res.status(404).send({
            message: "No hay electrodomesticos asociados al usuario"
          });
        }
        //  Obtener todos los consumos de las electrodomesticos
        const consumos = electrodomesticos.flatMap(electrodomestico => electrodomestico.consumo);
        return res.status(200).send(consumos);
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).send({
          message: "Ocurrió un error al recuperar los consumos.",
          error: error.message
        });
      });
  },
  createConsumo(req, res) {
    const { tiempo_consumo, consumo_energia, id_electrodomestico } = req.body;

    return consumo
      .create({
        tiempo_consumo: req.body.tiempo_consumo,
        consumo_energia: req.body.consumo_energia,
        id_electrodomestico: req.body.id_electrodomestico,
      })
      .then((nuevoConsumo) => {
        return res.status(201).send({ message: "Consumo creado correctamente" });
      })
      .catch((error) => {
        // Aquí estamos capturando el error correctamente
        return res.status(500).send({
          message: "Error al crear el consumo de energía",
          error: error.message, // Usamos error.message para el mensaje específico
        });
      });
  },
  updateConsumo(req, res) {
    return consumo
      .findByPk(req.params.id)
      .then((consumo) => {
        if (!consumo) {
          return res.status(404).send({ message: "Consumo no encontrado" });
        }

        const { tiempo_consumo, consumo_energia, id_electrodomestico } =
          req.body;

        if (tiempo_consumo) {
          consumo.tiempo_consumo = tiempo_consumo;
        }
        if (consumo_energia) {
          consumo.consumo_energia = consumo_energia;
        }
        if (id_electrodomestico) {
          consumo.id_electrodomestico = id_electrodomestico;
        }

        return consumo
          .save()
          .then(() => {
            return res.status(200).send({ message: "Consumo actualizado correctamente" });
          })
          .catch((error) =>
            res
              .status(400)
              .send({
                message: "Error al guardar el consumo",
                error: error.message,
              })
          );
      })
      .catch((error) =>
        res
          .status(400)
          .send({
            message: "Error al encontrar el consumo",
            error: error.message,
          })
      );
  },

  deleteConsumo(req, res) {
    return consumo
      .findByPk(req.params.id)
      .then((consumo) => {
        if (!consumo) {
          return res.status(404).send({ message: "Consumo no encontrado" });
        }

        return consumo
          .destroy()
          .then(() => res.status(200).send({ message: "Consumo eliminado correctamente" })) // Cambiado a 200 y mensaje en éxito
          .catch((error) => res.status(400).send());
      })
      .catch((error) => res.status(500).send());
  },

  predictConsumo(req, res) {
    if (!req.body.tiempo_prediccion) {
      return res.status(400).send({
        message: "El campo 'tiempo_prediccion' es requerido",
      });
    }

    console.log("Tiempo predicción recibido:", req.body.tiempo_prediccion);

    return consumo
      .findAll({
        attributes: ["tiempo_consumo", "consumo_energia"],
        order: [["tiempo_consumo", "ASC"]],
      })
      .then((data) => {
        if (!data || data.length < 10) {
          return res
            .status(400)
            .send({ message: "No hay suficientes datos para realizar predicciones" });
        }

        const tiempos = [];
        const consumos = [];
        data.forEach((registro) => {
          const tiempo = new Date(registro.tiempo_consumo).getTime();
          const consumo = registro.consumo_energia;
          if (tiempo > 0 && consumo >= 0) {
            tiempos.push(tiempo);
            consumos.push(consumo);
          }
        });

        if (tiempos.length < 2) {
          return res.status(400).send({
            message: "No hay suficientes datos válidos para realizar predicciones",
          });
        }

        const tiempoBase = Math.min(...tiempos);
        const tiemposNormalizados = tiempos.map((t) => t - tiempoBase);

        const regression = new mlReg(tiemposNormalizados, consumos);

        const pendienteOriginal = regression.slope; // Pendiente del modelo
        const ordenada = regression.intercept; // Ordenada al origen

        console.log("Pendiente original:", pendienteOriginal);
        console.log("Ordenada al origen:", ordenada);

        // Validar pendiente negativa y ajustar si es necesario
        const pendiente = pendienteOriginal < 0 ? 0 : pendienteOriginal;

        const tiempoPredecir =
          new Date(req.body.tiempo_prediccion).getTime() - tiempoBase;
        const consumoPredicho = pendiente * tiempoPredecir + ordenada;

        // Evitar valores negativos
        const consumoPredichoFinal = Math.max(0, consumoPredicho);

        console.log("Consumo predicho:", consumoPredichoFinal);

        return res.status(200).send({
          message: "Predicción realizada con éxito",
          tiempo_prediccion: req.body.tiempo_prediccion,
          consumo_predicho: consumoPredichoFinal, // Asegurar retorno adecuado
        });
      })
      .catch((error) => {
        console.error("Error durante la predicción:", error.message);
        return res.status(500).send({
          message: "Error al realizar la predicción",
          error: error.message,
        });
      });
  },

  predictConsumoByUserId(req, res) {
    const { tiempo_prediccion, id_usuario } = req.body;
  
    if (!tiempo_prediccion || !id_usuario) {
      return res.status(400).send({
        message: "Los campos 'tiempo_prediccion' e 'id_usuario' son requeridos",
      });
    }
  
    console.log("Tiempo predicción recibido:", tiempo_prediccion);
    console.log("ID usuario recibido:", id_usuario);
  
    return electrodomesticos
      .findAll({
        where: { id_usuario },
        include: [{
          model: consumo,
          as: "consumo",
          required: true,
          attributes: ["tiempo_consumo", "consumo_energia"],
        }],
      })
      .then((electrodomesticos) => {
        if (!electrodomesticos || electrodomesticos.length === 0) {
          return res.status(404).send({
            message: "No se encontraron consumos asociados al usuario",
          });
        }
  
        // Obtener todos los consumos relacionados
        const data = electrodomesticos.flatMap((electro) => electro.consumo);
  
        if (!data || data.length < 10) {
          return res
            .status(400)
            .send({ message: "No hay suficientes datos para realizar predicciones" });
        }
  
        const tiempos = [];
        const consumos = [];
        data.forEach((registro) => {
          const tiempo = new Date(registro.tiempo_consumo).getTime();
          const consumo = registro.consumo_energia;
          if (tiempo > 0 && consumo >= 0) {
            tiempos.push(tiempo);
            consumos.push(consumo);
          }
        });
  
        if (tiempos.length < 2) {
          return res.status(400).send({
            message: "No hay suficientes datos válidos para realizar predicciones",
          });
        }
  
        const tiempoBase = Math.min(...tiempos);
        const tiemposNormalizados = tiempos.map((t) => t - tiempoBase);
  
        const regression = new mlReg(tiemposNormalizados, consumos);
  
        const pendienteOriginal = regression.slope; // Pendiente del modelo
        const ordenada = regression.intercept; // Ordenada al origen
  
        console.log("Pendiente original:", pendienteOriginal);
        console.log("Ordenada al origen:", ordenada);
  
        // Validar pendiente negativa y ajustar si es necesario
        const pendiente = pendienteOriginal < 0 ? 0 : pendienteOriginal;
  
        const tiempoPredecir =
          new Date(tiempo_prediccion).getTime() - tiempoBase;
        const consumoPredicho = pendiente * tiempoPredecir + ordenada;
  
        // Evitar valores negativos
        const consumoPredichoFinal = Math.max(0, consumoPredicho);
  
        console.log("Consumo predicho:", consumoPredichoFinal);
  
        return res.status(200).send({
          message: "Predicción realizada con éxito",
          tiempo_prediccion,
          consumo_predicho: consumoPredichoFinal, // Asegurar retorno adecuado
        });
      })
      .catch((error) => {
        console.error("Error durante la predicción:", error.message);
        return res.status(500).send({
          message: "Error al realizar la predicción",
          error: error.message,
        });
      });
  }
  


};