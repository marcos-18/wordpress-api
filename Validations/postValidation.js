const Joi = require('joi');

const postValidation = Joi.object({
    post_author: Joi.string()
        .required()
        .messages({
            'string.empty': 'Author ID is required',
            'any.required': 'Author ID is required',
        }),
    post_content: Joi.string()
        .required()
        .messages({
            'string.empty': 'Post content is required',
            'any.required': 'Post content is required',
        }),
    post_title: Joi.string()
        .required()
        .messages({
            'string.empty': 'Post title is required',
            'any.required': 'Post title is required',
        }),
    post_status: Joi.string()
        .required()
        .messages({
            'string.empty': 'Post status is required',
            'any.required': 'Post status is required',
        }),
    post_type: Joi.string()
        .required()
        .messages({
            'string.empty': 'Post type is required',
            'any.required': 'Post type is required',
        }),
});

module.exports = { postValidation };