const mongoose = require("mongoose");


mongoose.connect('mongodb://127.0.0.1:27017/yelpcalm')
.then(() => {
    console.log("Mongodb connection succesful");
}).catch((e) => {
    console.log(e);
})

const {descriptors, places} = require("./seedHelpers");
const location = require("./cities");
const schema = mongoose.Schema;

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

const campgrounds = mongoose.model("campground", campgroundScheme);
campgrounds.deleteMany({})
.then((data) => {
    console.log("deleted all");
});

let hold = [];
for(let i = 0;i < 50; i++){
    const indx = Math.floor((Math.random() * 17)) + 1;
    hold.push({title: `${descriptors[indx]} ${places[indx]}`,
                location: `${location[indx].city} ${location[indx].state}`,
                image: "https://source.unsplash.com/random",
                user: "65b1fdda631e2db8063f647c",
                price: (Math.random() * 100).toFixed(2),
                Description: "This is one of the nice campground we have ever seen "
    });
}

campgrounds.insertMany(hold).then((data) => {
    console.log("inserted");
}).catch((err) => {
    console.log("failed to insert");
    console.log(err);
})


