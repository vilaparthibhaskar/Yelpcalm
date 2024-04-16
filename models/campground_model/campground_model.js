const mongoose = require("mongoose");
const schema = mongoose.Schema;
const reviewModel = require("../review_model/review_model.js");

// const imageScheme = new Schema({
//     url: String,
//     filename: String,
//     public_id: String
// });

const campgroundScheme = new schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    user: {
        type: schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    price: {
        type: mongoose.Decimal128,
        required: true,
        min: 0
    },
    Description: {
        type: String,
        required: true
    }
});

campgroundScheme.pre('findOneAndDelete', async function (next) {
    const cp_id = this.getQuery()._id;
    await reviewModel.deleteMany({campground: cp_id});
    next()
 });

const campgroundModel = mongoose.model("campground", campgroundScheme);

module.exports = campgroundModel;