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
    periodo_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "periodo_inicio",
      autoIncrement: false,
    },
    periodo_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "periodo_fin",
      autoIncrement: false,
    },
    consumo_total: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "consumo_total",
      autoIncrement: false,
    },
    consumo_maximo: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "consumo_maximo",
      autoIncrement: false,
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      comment: null,
      primaryKey: false,
      field: "id_usuario",
      autoIncrement: false,
      references: {
        key: "id",
        model: "Usuarios_model",
      },
    },
  };
  const options = {
    tableName: "Reporte",
    comment: "",
    indexes: [],
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    schema: "public",
  };
  const ReporteModel = sequelize.define("Reporte_model", attributes, options);
  ReporteModel.associate = function (models) {

    ReporteModel.belongsTo(models.Usuarios_model, {
      foreignKey: 'id_usuario',

    });

  };

  return ReporteModel;
};
