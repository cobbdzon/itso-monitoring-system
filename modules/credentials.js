import passport from "passport-local";
import { Person } from "./database.js";
import { compare } from "bcrypt";

const LocalStrategy = passport.Strategy;

async function authenthicateUser(username, password, done) {
	const user = await Person.findOne({ where: { username: username } });
	console.log(user.getDataValue("hashed_password"), password);
}

//passport.new(new LocalStrategy(), authenthicateUser);

//passport.serializeUser((user, done) => {});

//passport.deserializeUser((id, done) => {});

export default authenthicateUser;   
