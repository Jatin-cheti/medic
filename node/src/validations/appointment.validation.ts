import * as Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  doctorId: Joi.number().integer().required(),
  patientId: Joi.number().integer().required(),
  type: Joi.string().valid('Video', 'Audio', 'Physical').required(),
  date: Joi.date().iso().required(),
  time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
});
