import { genSalt, hash } from "bcrypt";
import { Sequelize, DataTypes, ENUM } from "sequelize";

const SequelizeInstance = new Sequelize("cla-db-dev", "admin", "", {
	host: "localhost",
	dialect: "postgresql",
	logging: false,
});

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

async function registerNewAdmin(username, password) {
	const pwdSalt = await genSalt(10);
	const pwdHash = await hash(password, pwdSalt);
	const newUser = await Person.create({
		hidden: true,
		permission_level: "admin",
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

// REGISTER DEFAULT ADMIN
// TODO: SUPPORT CHANGING PASSWORDS FROM .env
async function __registerDefaultAdmin() {
	const defaultAdmin = await Person.findOne({ where: { username: "admin", permission_level: "admin" } }).catch(err => {
		console.error(err)
	});
	if (!defaultAdmin) {
		registerNewAdmin("admin", process.env.DEFAULT_ADMIN_PASSWORD)
	}
}

SequelizeInstance.sync({ forced: true });
__registerDefaultAdmin()

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
};
export default SequelizeInstance;
