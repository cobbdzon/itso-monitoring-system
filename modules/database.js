import { Sequelize, DataTypes } from "sequelize";

const SequelizeInstance = new Sequelize("cla-db-dev", "admin", "", {
	host: "localhost",
	dialect: "postgresql",
});

const Person = SequelizeInstance.define("Person", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	hashed_password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	salt: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	time_table: {
		type: DataTypes.JSONB,
		allowNull: true,
	},
});

SequelizeInstance.sync({ forced: true });

export { SequelizeInstance, Person };
export default SequelizeInstance;
