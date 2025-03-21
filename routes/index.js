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
	if (user.permission_level == "member") {
		const isTimedIn = await checkUserTimedIn(user);
		const latestLog = await getLatestTimeLog(user);

		var lastLog;
		if (latestLog) {
			const logDate = new Date(latestLog["time"]);
			lastLog = `${logDate.toDateString()}, ${logDate.toLocaleTimeString()}`;

			// check if missed
			const todayDate = new Date();
			console.log(todayDate.getDate(), logDate.getDate())
			if (isTimedIn && todayDate.getDate() != logDate.getDate()) {
				req.flash("error", "You failed to time out yesterday! Please time out and time in to refresh your log.")
			}
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
	} else if (user.permission_level == "admin") {
		const timedInUsers = [];
		const users = await Person.findAll().then(async (users) => {
			const filteredUsers = [];
			for (let i = 0; i < users.length; i++) {
				const user = users[i];
				if (!user.hidden && user.permission_level == "member") {
					filteredUsers.push(user);
					timedInUsers[user.id] = await checkUserTimedIn(user);
				}
			}
			return filteredUsers;
		});

		res.render("admin", {
			navLocation: "admin",
			profileName: "",
			username: user.username,
			users: users,
			timedInUsers: timedInUsers,
		});
	}
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

router.get("/profile", async (req, res, next) => {
	const user = req.user;
	if (user) {
		const isTimedIn = await checkUserTimedIn(user);
		res.render("profile", {
			navLocation: "profile",
			username: user.username + "'s",
			profileName: user.username,
			userId: user.id,
			isTimedIn: isTimedIn,
			timeLogs: userHistoryToGroupedTimeLogs(user.history),
		});
	} else {
		req.flash("error", "You must log in first before viewing profile!");
		res.redirect("/login");
	}
});
``;
router.get("/profile/:id", async (req, res, next) => {
	const user = req.user;
	if (user) {
		if (user.permission_level == "admin") {
			const requestedUser = await getUserFromId(req.params.id);
			if (requestedUser && !requestedUser.hidden) {
				res.render("profile", {
					navLocation: "profile",
					username: requestedUser.username + "'s",
					profileName: "",
					userId: req.params.id,
					isTimedIn: await checkUserTimedIn(requestedUser),
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
