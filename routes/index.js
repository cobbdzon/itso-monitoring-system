import { Router } from "express";
import { Person } from "../modules/database.js";

var router = Router();

/* GET home page. */
router.get("/", (req, res, next) => {
	res.render("index", { title: "Express" });
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
