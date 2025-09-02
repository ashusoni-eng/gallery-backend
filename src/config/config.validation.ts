// config.validation.ts
import * as Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production")
    .default("development"),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default("api"),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("1d"),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),  
  
});
