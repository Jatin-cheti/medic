import * as Joi from 'joi';

export const uploadPrescriptionSchema = Joi.object({
  userId: Joi.number().integer().required(),
  type: Joi.string().valid('Image', 'Text').required(),
});
