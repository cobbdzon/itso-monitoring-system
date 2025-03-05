import { Router } from "express";
import {
	checkUserTimedIn,
	getLatestTimeLog,
	getUserFromId,
	Person,
} from "../modules/database.js";
import { checkAuthentication } from "../modules/credentials.js";

var router = Router();

function userHistoryToGroupedTimeLogs(history) {
	const timeLogs = {};
	for (let i = 0; i < history.length; i++) {
		const log = history[i];
		const logDate = new Date(log["time"]);
		const logDateString = logDate.toDateString();

		if (!timeLogs[logDateString]) {
			timeLogs[logDateString] = [];
		}

		timeLogs[logDateString].push(log);
	}
	return timeLogs;
}

/* GET home page. */
// TODO: ADD ADMIN VIEW PANEL
router.get("/", checkAuthentication, async (req, res, next) => {
	const user = req.user;
	const isTimedIn = await checkUserTimedIn(user);
	const latestLog = await getLatestTimeLog(user);

	var lastLog;
	if (latestLog) {
		const logDate = new Date(latestLog["time"]);
		lastLog = `${logDate.toDateString()}, ${logDate.toLocaleTimeString()}`;
	} else {
		lastLog = "User has never logged yet!";
	}

	var userStatus = isTimedIn ? "Timed In" : "Timed Out";
	res.render("index", {
		navLocation: "home",
		profileName: user.username,
		username: user.username,
		userStatus: userStatus,
		isTimedIn: isTimedIn,
		lastLog: lastLog,
		timeLogs: userHistoryToGroupedTimeLogs(user.history),
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
				const user = data[i];
				if (!user["hidden"]) {
					users.push(user["username"]);
				}
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
			username: user.username + "'s",
			profileName: user.username,
			timeLogs: userHistoryToGroupedTimeLogs(user.history),
		});
	} else {
		req.flash("error", "You must log in first before viewing profile!");
		res.redirect("/login");
	}
});
``
router.get("/profile/:id", async (req, res, next) => {
	const user = req.user;
	if (user) {
		if (user.permission_level == "admin") {
			const requestedUser = await getUserFromId(req.params.id);
			if (requestedUser && !requestedUser.hidden) {
				res.render("profile", {
					navLocation: "profile",
					username: requestedUser.username + "'s",
					profileName: requestedUser.username,
					timeLogs: userHistoryToGroupedTimeLogs(requestedUser.history),
				});
			} else {
				req.flash("error", `User with id: ${req.params.id} not found!`);
				res.redirect("/");
			}
		} else {
			req.flash(
				"error",
				"You do not have sufficient permission level to view this"
			);
			res.redirect("/");
		}
	} else {
		req.flash("error", "Please log in first!");
		res.redirect("/login");
	}
});

export default router;
