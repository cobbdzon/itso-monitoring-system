import { genSalt, genSaltSync, hash, hashSync } from "bcrypt";
import { Sequelize, DataTypes, ENUM } from "sequelize";
import { configDotenv } from "dotenv";

configDotenv();

const DATABASE_DIALECT = "postgresql";

const DATABASE_NAME = process.env.DATABASE_NAME || "cla-db-dev";
const DATABASE_USER = process.env.DATABASE_USER || "admin";
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "";

const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
const DATABASE_PORT = process.env.DATABASE_PORT || 5432;

const SequelizeInstance = new Sequelize(
	DATABASE_NAME,
	DATABASE_USER,
	DATABASE_PASSWORD,
	{
		host: DATABASE_HOST,
		port: DATABASE_PORT,
		dialect: DATABASE_DIALECT,
		logging: false,
	}
);

const Person = SequelizeInstance.define("Person", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	hidden: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
	permission_level: {
		type: ENUM("member", "admin"),
		defaultValue: "member",
		allowNull: false,
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

	// USER DATA
	// TODO: set all user data below to allowNull: true (BY ADDING FUNCTIONALITY)
	full_name: {
		type: DataTypes.STRING,
	},
	member_type: {
		type: ENUM("CLA", "OJT", "SA", "WI"),
	},
	assigned_building: {
		type: DataTypes.INTEGER,
	},
	accumulated_hours: {
		type: DataTypes.FLOAT,
		defaultValue: 0,
		allowNull: false
	},
	schedule: {
		type: DataTypes.JSONB,
	},

	lastTimeIn: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	lastTimeOut: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	history: {
		type: DataTypes.ARRAY(DataTypes.JSONB),
		allowNull: false,
	},
});

async function getUserFromUsername(username) {
	return await Person.findOne({ where: { username: username } });
}

async function getUserFromId(id) {
	return await Person.findOne({ where: { id: id } });
}

async function getUserOrUsername(userOrUsername) {
	if (typeof userOrUsername == "string") {
		const username = userOrUsername;
		return await getUserFromUsername(username);
	}
	return userOrUsername;
}

// REGISTER
async function registerNewUser(username, password) {
	const pwdSalt = await genSalt(10);
	const pwdHash = await hash(password, pwdSalt);
	const newUser = await Person.create({
		username: username,
		hashed_password: pwdHash,
		salt: pwdSalt,

		lastTimeIn: 0,
		lastTimeOut: 0,

		history: [],
	});
	await newUser.save();
	return newUser;
}

// TIME IN TIME OUT
async function getHistoryLength(history) {
	return Object.keys(history).length;
}

async function checkUserTimedIn(userOrUsername) {
	const user = await getUserOrUsername(userOrUsername);
	if (!user) return false;

	const latestLog = await getLatestTimeLog(user);
	if (!latestLog) return false;

	const logType = latestLog["type"]; // "in" || "out"
	const logTime = latestLog["time"];

	return logType == "in";
}

async function getLatestTimeLog(userOrUsername) {
	const user = await getUserOrUsername(userOrUsername);
	if (!user) return false;

	const history = user.history;
	if (history && getHistoryLength(history) <= 0) return;
	const latestLog = history[0];
	return latestLog;
}

async function timeInUser(userOrUsername) {
	const user = await getUserOrUsername(userOrUsername);
	if (!user) return false;
	if (checkUserTimedIn(user) == true) return false;

	const newHistory = Object.assign([], user.history);
	newHistory.unshift({
		type: "in",
		time: new Date().valueOf(),
	});
	await user.update({ history: newHistory });

	return true;
}

async function timeOutUser(userOrUsername) {
	const user = await getUserOrUsername(userOrUsername);
	if (!user) return false;
	if (checkUserTimedIn(user) == false) return false;

	const newHistory = Object.assign([], user.history);
	newHistory.unshift({
		type: "out",
		time: new Date().valueOf(),
	});
	await user.update({ history: newHistory });

	return true;
}

async function changeUsername(userOrUsername, newUsername) {
	const user = await getUserOrUsername(userOrUsername);
	if (!user) return null;

	const isValid = /^[a-zA-Z][a-zA-Z0-9_\ ]*$/.test(newUsername);
	if (!isValid) return false;

	await user.update({ username: newUsername });
	return true;
}

// REGISTER DEFAULT ADMIN
// TODO: SUPPORT CHANGING PASSWORDS FROM .env
async function __registerDefaultAdmin() {
	const pwdSalt = genSaltSync(10);
	const pwdHash = hashSync(process.env.DEFAULT_ADMIN_PASSWORD, pwdSalt);
	const [defaultAdmin, created] = await Person.findOrCreate({
		where: { username: "admin", permission_level: "admin" },
		defaults: {
			hidden: true,
			permission_level: "admin",
			username: "admin",
			hashed_password: pwdHash,
			salt: pwdSalt,

			lastTimeIn: 0,
			lastTimeOut: 0,

			history: [],
		},
	}).catch((err) => {
		console.error(err);
	});
	if (created == false && pwdHash != defaultAdmin.hashed_password) {
		defaultAdmin.update({
			hashed_password: pwdHash,
			salt: pwdSalt,
		});
	}
}

SequelizeInstance.sync({ forced: true }).then(__registerDefaultAdmin);

export {
	SequelizeInstance,
	Person,
	getUserFromUsername,
	getUserFromId,
	registerNewUser,
	getLatestTimeLog,
	checkUserTimedIn,
	timeInUser,
	timeOutUser,
	changeUsername,
};
export default SequelizeInstance;
