const Joi = require('joi');

const userSchema = Joi.object({
    user_pass: Joi.string()
        .min(5)
        .max(16)
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,16}$/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least {#limit} characters',
            'string.max': 'Password must be at most {#limit} characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required',
        }),

    first_name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.empty': 'First Name is required',
            'string.min': 'First Name must be at least {#limit} characters',
            'string.max': 'First Name must be at most {#limit} characters',
            'any.required': 'First Name is required',
        }),

    last_name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Last Name is required',
            'string.min': 'Last Name must be at least {#limit} characters',
            'string.max': 'Last Name must be at most {#limit} characters',
            'any.required': 'Last Name is required',
        }),

    user_email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required',
        }),

    user_role: Joi.string()
        .required()
        .messages({
            'any.required': 'Email is required',
        }),
    user_status: Joi.boolean()
        .required()
        .messages({
            'any.required': 'User Status is required',
        }),
});

module.exports = { userSchema };