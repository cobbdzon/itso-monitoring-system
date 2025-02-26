import passport from "passport";
import { Strategy } from "passport-local";
import { Person } from "./database.js";
import { compare } from "bcrypt";

const LocalStrategy = Strategy;

async function getUserFromUsername(username) {
	return await Person.findOne({ where: { username: username } });
}

async function getUserFromId(id) {
	return await Person.findOne({ where: { id: id } });
}

async function authenthicateUser(username, password, done) {
	const user = await getUserFromUsername(username);

	if (user == null) {
		return done(null, false, { message: "No user with that username" });
	}

	try {
		if (await compare(password, user.hashed_password)) {
			console.log("auth success");
			return done(null, user);
		} else {
			console.log("password incorrect");
			return done(null, false, { message: "Password incorrect" });
		}
	} catch (err) {
		console.log(err);
	}
}

function checkAuthentication(req, res, next) {
	if (req.isAuthenticated()) {
		return next()
	}
	res.redirect("/login")
}

passport.use(
	new LocalStrategy(
		{ usernameField: "username", passwordField: "password" },
		authenthicateUser
	)
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	return done(null, await getUserFromId(id));
});

console.log("Passport configured");

export { checkAuthentication }
export default passport;
