const mongoose = require("mongoose");
const schema = mongoose.Schema;

const reviewScheme = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    campground: {
        type: schema.Types.ObjectId,
        ref: 'campground',
        required: true
    },
    text: {
        type: String,
    },
    rating: {
        type: Number,
    }
});

const review = mongoose.model("review", reviewScheme);

module.exports = review;