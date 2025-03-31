import Joi from "joi";

export const validateCreatePost = ( title: string, content: string) => {
    const schema = Joi.object({
        title: Joi.string().required().min(4).max(30),
        content: Joi.string().required().min(3).max(5000),
        mediaIds: Joi.array(),
    });

    return schema.validate({ title, content });
}
