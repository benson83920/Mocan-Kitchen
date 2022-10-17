const router = require("express").Router();
const Post = require("../models/post-model");

//這個middleware是用來驗證身分是否登入
const authCheck = (req, res, next) => {
	if (!req.isAuthenticated()) {
		// req.originalUrl可以記錄原本的網址在哪裡
		req.session.returnTo = req.originalUrl; //profile/post
		res.redirect("/auth/login");
	} else {
		next();
	}
};

router.get("/", authCheck, async (req, res) => {
	let postFound = await Post.find({ author: req.user._id });

	res.render("profile.ejs", { user: req.user, posts: postFound });
});

router.get("/post", authCheck, (req, res) => {
	res.render("post.ejs", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
	let { title, content } = req.body;
	let newPost = new Post({ title, content, author: req.user._id });
	try {
		await newPost.save();
		res.status(200).redirect("/profile");
	} catch (err) {
		req.flash("error_msg", "Both title and content are required");
		res.redirect("/profile/post");
	}
});

module.exports = router;
