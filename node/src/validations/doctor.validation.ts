import * as Joi from 'joi';

export const setConsultationRateSchema = Joi.object({
  rate: Joi.number().positive().required().messages({
    'number.base': 'Consultation rate must be a number.',
    'number.positive': 'Consultation rate must be greater than zero.',
    'any.required': 'Consultation rate is required.',
  }),
});
