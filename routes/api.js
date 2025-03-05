import { Router } from "express";
import {
	changeUsername,
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

router.post("/timein", async (req, res, next) => {
	const user = req.user;
	if (await timeInUser(user)) {
		res.status(200);
	}
	res.redirect("/");
});

router.post("/timeout", async (req, res, next) => {
	const user = req.user;
	if (await timeOutUser(user)) {
		res.status(200);
	}
	res.redirect("/");
});

router.post("changeusername", async (req, res, next) => {
	const user = req.user;
	const { newUsername } = req.body;
	if (user && user.permission_level == "admin") {
		changeUsername(user, newUsername);
	} else {
		req.flash("error", "Unauthorized")
		res.statusCode(401);
	}
});

export default router;
