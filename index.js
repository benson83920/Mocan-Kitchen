const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/auth-route");
const profileRoute = require("./routes/profile-route");
require("./config/passport");
const cookieSession = require("cookie-session");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

mongoose
	.connect(process.env.DB_CONNECT, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("connected to MongoDB atlas");
	})
	.catch((err) => {
		console.log("error connecting");
		console.log(err);
	});

//middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

// passport.initialize() 和 passport.session()會讓 browser 儲存 cookie
app.use(passport.initialize());
app.use(passport.session());
//以下是flash很常見的用法
app.use(flash());
// 下面的middleware可以將成功或是錯誤的訊息顯示在登入或是註冊的畫面的正上方,而不是只顯是一個json資料
app.use((req, res, next) => {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});
app.use("/auth", authRoute); //在進入這個檔案時，如果有進入到 /auth 的話就可以直接進入authRoute去做驗證
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
	res.render("index.ejs", { user: req.user });
});

app.get("/cake", (req, res) => {
	res.render("cake.ejs", { user: req.user });
});

app.get("/pudding", (req, res) => {
	res.render("pudding.ejs", { user: req.user });
});

app.get("/fried_food", (req, res) => {
	res.render("fried_food.ejs", { user: req.user });
});

app.listen(8080, () => {
	console.log("listening on port 8080");
});
