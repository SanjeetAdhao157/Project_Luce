const Joi = require("joi");

const productJoiSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required().min(1),
  description: Joi.string().required(),
  discount: Joi.number().optional().min(0).max(100).default(0),
  itemType: Joi.string().valid("shoes", "bags", "watches").required(),
});

module.exports = productJoiSchema;
