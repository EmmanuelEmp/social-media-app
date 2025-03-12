import Joi from "joi";

export const validateRegisterInput = (username: string, email: string, password: string) => {
    const schema = Joi.object({
        username: Joi.string().required().min(4).max(30),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
    });

    return schema.validate({ username, email, password });
}
export const validateLoginInput = ( email: string, password: string) => {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
    });

    return schema.validate({ email, password });
}