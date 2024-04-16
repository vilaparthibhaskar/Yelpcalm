const Joi = require('joi');

module.exports.campgroundschema = Joi.object({
    title: Joi.string()
        .required(),
    location: Joi.string()
        .required(),
    price: Joi.number()
        .required(),
    Description: Joi.string()
        .required()
});

module.exports.reviewschema = Joi.object({
    text: Joi.string()
        .required(),
    rating: Joi.number()
        .required()
});

