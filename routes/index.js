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
	const isTimedIn = await checkUserTimedIn(req.user);
	const latestLog = await getLatestTimeLog(req.user);

	var lastLog;
	if (latestLog) {
		const logDate = new Date(latestLog["time"]);
		lastLog = logDate.toString();
	} else {
		lastLog = "User has not logged yet!";
	}

	var userStatus = isTimedIn ? "Timed In" : "Timed Out";
	res.render("index", {
		navLocation: "home",
		profileName: req.user.username,
		username: req.user.username,
		userStatus: userStatus,
		isTimedIn: isTimedIn,
		lastLog: lastLog,
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
		});
	} else {
		req.flash("error", "You must log in first before viewing profile!");
		res.redirect("/login");
	}
});

export default router;
