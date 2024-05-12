const { z } = require('zod');

const quantityValueSchema = z.number({
  value: z.number(),
});

const quantityUnitSchema = z.string({
  unit: z.enum(['ml', 'g']),
});

const quantitySchema = z.object({
  value: quantityValueSchema,
  unit: quantityUnitSchema,
});

const durationValueSchema = z.number({
  value: z.number().min(1).max(1440),
});

const durationUnitSchema = z.string({
  unit: z.enum('minutes'),
});

const durationSchema = z.object({
  value: durationValueSchema,
  unit: durationUnitSchema,
});

const recordSchema = z.object({
  quantity: quantitySchema.optional(),
  duration: durationSchema.optional(),
  note: z.string().optional(),
});

const recordValidation = recordSchema.parse;

module.exports = recordValidation;
