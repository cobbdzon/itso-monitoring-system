import { Router } from "express";
import { genSalt, hash } from "bcrypt";
import { Person } from "../modules/database.js";
import authenthicateUser from "../modules/credentials.js";

var router = Router();

router.get("/", (req, res) => {
	res.send("API is up!");
});

router.post("/register", async (req, res, next) => {
	const { username, password } = req.body;
	try {
		const pwdSalt = await genSalt(10);
		const pwdHash = await hash(password, pwdSalt);
		const newUser = await Person.create({
			username: username,
			hashed_password: pwdHash,
			salt: pwdSalt,
		});
		await newUser.save();
		res.json(newUser);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/login", (req, res, next) => {
	const { username, password } = req.body;
	authenthicateUser(username)
	res.redirect("/login");
});

export default router;
