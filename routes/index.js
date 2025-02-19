import { Router } from "express";
import { Sequelize, DataTypes } from "sequelize";
import { sha256, sha224 } from "js-sha256";

var router = Router();

const sequelize = new Sequelize("cla-db-dev", "admin", "", {
  host: "localhost",
  dialect: "postgresql",
});

const Person = sequelize.define(
	"Person",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		pwdHash: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		timeTable: {
			type: DataTypes.HSTORE,
			allowNull: true
		}
	}
)

sequelize.sync({ forced: true })

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

var users = ["Jaime Godino Jr.", "Clark Jacob Dizon"];

router.get("/login", function (req, res, next) {
	Person.findAll().then((data) => {
		var users = []
		for (let i = 0; i < data.length; i++) {
			const person = data[i];
			users[i] = person["dataValues"]["name"]
		}

		res.render("login", {users: users});
	})
});

export default router;
