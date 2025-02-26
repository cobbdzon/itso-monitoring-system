import { Router } from "express";
import { Person } from "../modules/database.js";
import { checkAuthentication } from "../modules/credentials.js";

var router = Router();

/* GET home page. */
router.get("/", checkAuthentication, async (req, res, next) => {
	res.render("index", { username: req.user.username });
});

router.get("/login", (req, res, next) => {
	Person.findAll().then((data) => {
		var users = [];
		for (let i = 0; i < data.length; i++) {
			const person = data[i];
			users[i] = person["dataValues"]["username"];
		}
		res.render("login", {
			navLocation: "login",
			users: users,
		});
	});
});

export default router;
