const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const campgroundModel = require("./models/campground_model/campground_model.js");
const methodOverride = require('method-override')
const {catchAsync, UserError} = require('./utils/Error.js')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const userModel = require("./models/user_model/user_model.js");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const {isLoggedIn, isAuthor, isAuthor_r, validateCampground, validatereview} = require("./middleware/middleware.js");
const reviewModel = require("./models/review_model/review_model.js");
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });




mongoose.connect('mongodb://127.0.0.1:27017/yelpcalm')
.then(() => {
    console.log("Mongodb connection succesful");
}).catch((e) => {
    console.log(e);
})

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set('layout', path.join(__dirname, "views/layouts/layout"));

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(userModel.authenticate()));
  
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

cloudinary.config({
    cloud_name: 'dnwnghgj9',
    api_key: '535175294492347',
    api_secret: 'CpHITfPr05qHZsMjmxWbqGKtZ1E',
  });

  
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get("/", catchAsync(async (req, res, next) => {
    res.render("users/login");
}));

app.get("/register", catchAsync(async (req, res, next) => {
    res.render("users/register");
}));

app.get("/logout", catchAsync(async (req, res, next) => {
    req.logout(err => {
        if(err) next(err)
    });
    res.redirect("/");
}));

app.get("/campgrounds", isLoggedIn, catchAsync(async (req, res, next) => {
    const campgrounds = await campgroundModel.find({});
    res.render("campgrounds/home", {campgrounds});
}));

app.get("/campgrounds/new", isLoggedIn, catchAsync(async (req, res) => {
    res.render("campgrounds/new");
}));


app.get("/campgrounds/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    const cp = await campgroundModel.findById(id);
    res.render("campgrounds/edit", {cp});
}));

app.put("/campgrounds/:id/edit", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const {title, location, image, price, Description} = req.body;
    const {id} = req.params;
    await campgroundModel.updateOne(
        {_id:id}, 
        { $set: {title, 
        location, 
        image, 
        price,
        Description} });
    res.redirect("/campgrounds");
}));

app.get("/campgrounds/:id", isLoggedIn, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await campgroundModel.findById(id).populate('user');
    const reviews = await reviewModel.find({campground:id}).populate('user');
    res.render("campgrounds/details", {campground, reviews});
}));

app.post("/campgrounds/:id/review", isLoggedIn, validatereview, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    let {review, rating} = req.body;
    const campground = await campgroundModel.findById(id);
    if(!rating) rating = 1;
    newReview = new reviewModel({user: req.user, text: review, campground : campground._id, rating});
    await newReview.save();
    res.redirect(`/campgrounds/${id}`);
}));

app.post("/register", catchAsync(async (req, res, next) => {
    const {username, email, password} = req.body;
    newuser = new userModel({email, username});
    registeredUser = await userModel.register(newuser, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    });
}));

app.post("/", passport.authenticate('local', { failureFlash: true, failureRedirect: '/' }), catchAsync(async (req, res, next) => {
    res.redirect('/campgrounds');
}));

app.post("/campgrounds", isLoggedIn, upload.single('image'), catchAsync(async (req, res) => {
    const result = await cloudinary.uploader.upload(req.file.path);
    let {title, location, price, Description} = req.body;
    //if(!image) image = "https://source.unsplash.com/random";
    //const temp = "https://source.unsplash.com/random";
    const cg = new campgroundModel({title, location, image: result.secure_url, price, Description, user: req.user});
    await cg.save();
    req.flash("success", "created a new campground");
    res.redirect("/campgrounds");
}));

app.delete("/campgrounds/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    await campgroundModel.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.delete("/campgrounds/:id/review/:rid", isLoggedIn, isAuthor_r, catchAsync(async (req, res) => {
    const {id, rid} = req.params;
    await reviewModel.findByIdAndDelete(rid);
    res.redirect(`/campgrounds/${id}`);
}));

app.use((err, req, res, next) => {
    if(err){
        console.log(err);
        res.render("Error/error", {err})
    }
})

app.listen("3000", () =>{
    console.log("listening to port 3000");
})