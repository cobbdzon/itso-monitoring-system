import { Router } from "express";
import {
	changeUsername,
	getUserFromId,
	Person,
	registerNewUser,
	timeInUser,
	timeOutUser,
} from "../modules/database.js";
import passport, { getUserFromUsername } from "../modules/credentials.js";

var router = Router();

router.get("/", (req, res) => {
	res.send("API is up!");
});

router.post("/register", async (req, res, next) => {
	const { username, password, confirmPassword } = req.body;

	if (username == "" || password == "" || confirmPassword == "") {
		req.flash("error", "At least one field is empty");
		res.status(400);
		res.redirect("/register");
		return;
	}

	if (password != confirmPassword) {
		req.flash("error", "Passwords does not match!");
		res.status(400);
		res.redirect("/register");
		return;
	}

	const existingUser = await getUserFromUsername(username);
	if (existingUser != null) {
		req.flash("error", "User " + username + " already exists!");
		res.status(409);
		res.redirect("/register");
		return;
	} else {
		try {
			const newUser = await registerNewUser(username, password);
			res.redirect("/login");
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: true,
	})
);

router.post("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/login");
	});
});

// user
router.post("/timein", async (req, res, next) => {
	const user = req.user;
	if (await timeInUser(user)) {
		res.status(200);
	}
	res.redirect("back");
});

router.post("/timeout", async (req, res, next) => {
	const user = req.user;
	if (await timeOutUser(user)) {
		res.status(200);
	}
	res.redirect("back");
});

// admin
router.post("/timein/:id", async (req, res, next) => {
	const user = req.user;
	if (user) {
		if (user.permission_level == "admin") {
			const requestedUser = await getUserFromId(req.params.id);
			if (requestedUser && !requestedUser.hidden) {
				if (await timeInUser(requestedUser)) {
					res.status(200);
				}
				res.redirect("back");
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

router.post("/timeout/:id", async (req, res, next) => {
	const user = req.user;
	if (user) {
		if (user.permission_level == "admin") {
			const requestedUser = await getUserFromId(req.params.id);
			if (requestedUser && !requestedUser.hidden) {
				if (await timeOutUser(requestedUser)) {
					res.status(200);
				}
				res.redirect("back");
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

router.post("/changeusername", async (req, res, next) => {
	const user = req.user;
	const { newUsername } = req.body;
	if (user && user.permission_level == "admin") {
		const result = await changeUsername(user, newUsername);
		if (result == true) {
			req.flash("success", "Successfully changed username!");
			res.redirect("back");
		} else if (result == false) {
			req.flash("error", "Username is invalid!");
			res.statusCode(400);
		} else if (result == null) {
			req.flash("error", "User is not valid");
			res.statusCode(400);
		}
	} else {
		req.flash("error", "Unauthorized");
		res.statusCode(401);
	}
});

router.post("/changeusername/:id", async (req, res, next) => {
	const user = req.user;
	const { newUsername } = req.body;
	if (user) {
		if (user.permission_level == "admin") {
			const requestedUser = await getUserFromId(req.params.id);
			const result = await changeUsername(requestedUser, newUsername);
			if (result == true) {
				req.flash("success", "Successfully changed username!");
			} else if (result == false) {
				req.flash("error", "Username is invalid!");
			} else if (result == null) {
				req.flash("error", "User is not valid");
			}
			res.redirect("back");
		} else {
			req.flash("error", "Unauthorized");
			res.redirect("/");
		}
	} else {
		req.flash("error", "Please log in first!");
		res.redirect("/login");
	}
});

router.post("/deleteuser/:id", async (req, res, next) => {
	const user = req.user;
	if (user) {
		if (user.permission_level == "admin") {
			const requestedUser = await getUserFromId(req.params.id);
			if (requestedUser) {
				await requestedUser.destroy();
				res.redirect("back");
			} else {
				req.flash("error", `User with id: ${req.params.id} not found!`);
				res.redirect("/");
			}
		} else {
			req.flash("error", "Unauthorized");
			res.redirect("/");
		}
	} else {
		req.flash("error", "Please log in first!");
		res.redirect("/login");
	}
});

export default router;
