import Joi from 'joi';

export const verifyDoctorSchema = Joi.object({
  doctorId: Joi.number().required(),
  status: Joi.string().valid('Approved', 'Rejected', 'Pending').required(),
  comments: Joi.string().optional(),
});

export const addAdminSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
