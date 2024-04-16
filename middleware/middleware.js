const campgroundModel = require("../models/campground_model/campground_model");
const reviewModel = require("../models/review_model/review_model");
const {campgroundschema, reviewschema} = require("./validation");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.user){
        req.flash('error', 'You must be signed in first!');
        res.redirect("/")
        return 
    }
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const cp = await campgroundModel.findById(id);
    if(cp.user._id.equals(req.user._id)){       
        next();
        return;
    }
    else{
        req.flash('error', "you cannot delete this");
        res.redirect(`/campgrounds`);
        return
    }
}

module.exports.isAuthor_r = async (req, res, next) => {
    const {id, rid} = req.params;
    const rw = await reviewModel.findById(rid).populate("user");
    if(rw.user._id.equals(req.user._id)){       
        next();
        return;
    }
    else{
        req.flash('error', "you cannot delete this");
        res.redirect(`/campgrounds/${id}`);
        return
    }
}

module.exports.validateCampground = async (req, res, next) => {
    let {title, location, price, Description} = req.body;
    const {value, error} = await campgroundschema.validate({title, location, price, Description});
    console.log("working", value, error);
    if(error){
        req.flash('error', 'fill the required fields');
        res.redirect('/campgrounds');
        return;
    }
    next();
        return;
}

module.exports.validatereview = async (req, res, next) => {
    const {id} = req.params;
    let {review, rating} = req.body;
    const {value, error} = await reviewschema.validate({text: review, rating});
    if(error){
        req.flash('error', 'fill the review correctly');
        res.redirect(`/campgrounds/${id}`);
        return;
    }
    next();
        return;
}