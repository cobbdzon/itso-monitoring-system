import { Router } from "express";
import {
	checkUserTimedIn,
	getLatestTimeLog,
	Person,
} from "../modules/database.js";
import { checkAuthentication } from "../modules/credentials.js";

var router = Router();

/* GET home page. */
router.get("/", checkAuthentication, async (req, res, next) => {
	const user = req.user;
	const isTimedIn = await checkUserTimedIn(user);
	const latestLog = await getLatestTimeLog(user);

	var lastLog;
	if (latestLog) {
		const logDate = new Date(latestLog["time"]);
		lastLog = `${logDate.toDateString()}, ${logDate.toLocaleTimeString()}`;
	} else {
		lastLog = "User has not logged yet!";
	}

	const timeLogs = {};
	for (let i = 0; i < user.history.length; i++) {
		const log = user.history[i];
		const logDate = new Date(log["time"]);
		const logDateString = logDate.toDateString();

		if (!timeLogs[logDateString]) {
			timeLogs[logDateString] = [];
		}

		timeLogs[logDateString].push(log);
	}

	var userStatus = isTimedIn ? "Timed In" : "Timed Out";
	res.render("index", {
		navLocation: "home",
		profileName: user.username,
		username: user.username,
		userStatus: userStatus,
		isTimedIn: isTimedIn,
		lastLog: lastLog,
		timeLogs: timeLogs,
	});
});

router.get("/register", (req, res, next) => {
	const user = req.user;
	if (user) {
		res.redirect("/");
	} else {
		res.render("register", {
			navLocation: "register",
			profileName: "",
		});
	}
});

router.get("/login", (req, res, next) => {
	const user = req.user;
	if (user) {
		res.redirect("/");
	} else {
		Person.findAll().then((data) => {
			var users = [];
			for (let i = 0; i < data.length; i++) {
				const person = data[i];
				users[i] = person["dataValues"]["username"];
			}
			res.render("login", {
				navLocation: "login",
				profileName: "",
				users: users,
			});
		});
	}
});

router.get("/profile", (req, res, next) => {
	const user = req.user;
	if (user) {
		res.render("profile", {
			navLocation: "profile",
			profileName: user.username,
			timeLogs: user.history,
		});
	} else {
		req.flash("error", "You must log in first before viewing profile!");
		res.redirect("/login");
	}
});

export default router;
