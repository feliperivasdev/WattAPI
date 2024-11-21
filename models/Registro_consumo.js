const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: true,
      field: "id",
      autoIncrement: true,
    },
    tiempo_consumo: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "tiempo_consumo",
      autoIncrement: false,
    },
    consumo_energia: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "consumo_energia",
      autoIncrement: false,
    },
    id_electrodomestico: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "id_electrodomestico",
      autoIncrement: false,
      references: {
        key: "id",
        model: "Electrodomesticos_model",
      },
    },
  };
  const options = {
    tableName: "Registro_consumo",
    comment: "",
    indexes: [],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: "public",
  };
  const RegistroConsumoModel = sequelize.define("Registro_consumo_model", attributes, options);
  RegistroConsumoModel.associate = function (models) {

    RegistroConsumoModel.belongsTo(models.Electrodomesticos_model, {
      foreignKey: 'id_electrodomestico',

    });
  };


  return RegistroConsumoModel;
};
