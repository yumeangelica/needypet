const { z } = require('zod');

const quantityValueSchema = z
  .number({ message: 'Quantity value must be a number' })
  .min(1, { message: 'Quantity must be at least 1' });

const quantityUnitSchema = z.enum(['ml', 'g'], {
  message: 'Quantity unit must be ml or g',
});

const quantitySchema = z.object({
  value: quantityValueSchema,
  unit: quantityUnitSchema,
});

const durationValueSchema = z
  .number({ message: 'Duration value must be a number' })
  .min(1, { message: 'Duration must be at least 1 minute' })
  .max(1440, { message: 'Duration cannot be over 1440 minutes' });

const durationUnitSchema = z.enum(['minutes'], {
  message: 'Duration unit must be minutes',
});

const durationSchema = z.object({
  value: durationValueSchema,
  unit: durationUnitSchema,
});

const recordSchema = z
  .object({
    quantity: quantitySchema.optional(),
    duration: durationSchema.optional(),
    note: z.string().optional(),
  })
  .superRefine((record, ctx) => {
    const measurementCount = Number(Boolean(record.quantity)) + Number(Boolean(record.duration));

    if (measurementCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quantity'],
        message: 'Care record must have exactly one measurement type',
      });
    }
  });

const recordValidation = (data) => {
  try {
    return recordSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }

    throw new Error('Unknown error during validation', { cause: error });
  }
};

module.exports = recordValidation;
