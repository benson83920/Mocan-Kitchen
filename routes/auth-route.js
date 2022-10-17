const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

router.get("/login", (req, res) => {
	res.render("login", { user: req.user });
});

router.get("/signup", (req, res) => {
	res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
	let { name, email, password } = req.body;
	//檢查使用者是否被註冊過
	const emailExist = await User.findOne({ email });
	if (emailExist) {
		req.flash("error_msg", "Email already exists");
		res.redirect("/auth/signup");
	}

	const hash = await bcrypt.hash(password, 10);
	password = hash;
	let newUser = new User({ name, email, password });
	try {
		await newUser.save();
		req.flash("success_msg", "Registration succeeds");
		res.redirect("/auth/login");
	} catch (err) {
		req.flash("error_msg", err.errors.name.properties.message);
		res.redirect("/auth/signup");
	}
});

router.get("/logout", (req, res) => {
	req.logOut();
	res.redirect("/");
});

router.post(
	"/login",
	passport.authenticate("local", {
		failureRedirect: "/auth/login",
		failureFlash: "使用者email或是密碼錯誤",
	}),
	(req, res) => {
		if (req.session.returnTo) {
			let newPath = req.session.returnTo;
			req.session.returnTo = "";
			res.redirect(newPath);
		} else {
			res.redirect("/profile");
		}
	}
);

//讓使用者可以選擇登入的帳號
router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		prompt: "select_account",
	})
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
	if (req.session.returnTo) {
		let newPath = req.session.returnTo;
		req.session.returnTo = "";
		res.redirect(newPath);
	} else {
		res.redirect("/profile");
	}
});

module.exports = router;
