const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userScheme = new schema({
    Email: {
        type: String
    }
});

userScheme.plugin(passportLocalMongoose)
const users = mongoose.model("user", userScheme);


module.exports = users;