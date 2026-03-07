import Joi from 'joi';

const validateSignup = (data: any) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('patient', 'doctor', 'admin', 'superadmin').required(),
    });
    return schema.validate(data);
};

const validateLogin = (data: any) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
};

export { validateSignup, validateLogin };
