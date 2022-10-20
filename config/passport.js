const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

//passport可以進行第三方登入
passport.serializeUser((user, done) => {
	console.log("Serialized user");
	done(null, user._id);
});

passport.deserializeUser((_id, done) => {
	console.log("Deserialized user now");
	User.findById({ _id }).then((user) => {
		console.log("Found User");
		done(null, user);
	});
});

passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ email: username })
			.then(async (user) => {
				if (!user) {
					return done(null, false);
				}
				await bcrypt.compare(password, user.password, function (err, result) {
					if (err) {
						return done(null, false);
					}
					if (!result) {
						return done(null, false);
					} else {
						return done(null, user);
					}
				});
			})
			.catch((err) => {
				return done(null, false);
			});
	})
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/auth/google/redirect",
		},
		(accessToken, refreshToken, profile, done) => {
			console.log("accessToken: ", accessToken);
			//passport callback
			User.findOne({ googleID: profile.id }).then((foundUser) => {
				if (foundUser) {
					//如果能找到使用者的話
					console.log("User is already exists.");
					done(null, foundUser);
				} else {
					//如果找不到使用著的話，就創造一個數據儲存進去mongoDB
					new User({
						name: profile.displayName,
						googleID: profile.id,
						thumbnail: profile.photos[0].value,
						email: profile.emails[0].value,
					})
						.save()
						.then((newUser) => {
							console.log("New user created.");
							done(null, newUser);
						});
				}
			});
		}
	)
);
