const { z } = require('zod');

// The dateFor value is converted to a Date in the controller before validation runs.
const dateForSchema = z.date({ message: 'A valid date is required' });

const categorySchema = z
  .string()
  .min(3, { message: 'Category must be at least 3 characters' })
  .max(50, { message: 'Category must be at most 50 characters' });

const descriptionSchema = z
  .string()
  .max(1000, { message: 'Description must be at most 1000 characters' });

const timesSchema = z.number().min(1);

const periodicityUnitSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'custom',
]);

const periodicityIntervalSchema = z.number().min(1);

const periodicityCustomIntervalDaysSchema = z.number().min(1);

const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const periodicityStartDateSchema = z.string().regex(isoDateTimeRegex);

const periodicityEndDateSchema = z.string().regex(isoDateTimeRegex);

const periodicityNextReminderSchema = z.string().regex(isoDateTimeRegex);

const periodicityActiveSchema = z.boolean();

const periodicitySchema = z.object({
  unit: periodicityUnitSchema,
  interval: periodicityIntervalSchema,
  customIntervalDays: periodicityCustomIntervalDaysSchema,
  startDate: periodicityStartDateSchema,
  endDate: periodicityEndDateSchema,
  nextReminder: periodicityNextReminderSchema,
  active: periodicityActiveSchema,
});

const frequencySchema = z.object({
  times: timesSchema,
  periodicity: periodicitySchema,
});

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

const completedSchema = z.boolean();

const archivedSchema = z.boolean();

const isActiveSchema = z.boolean();

const needSchema = z.object({
  dateFor: dateForSchema,
  category: categorySchema,
  description: descriptionSchema,
  frequency: frequencySchema.optional(),
  quantity: quantitySchema.optional(),
  duration: durationSchema.optional(),
  completed: completedSchema.optional(),
  archived: archivedSchema.optional(),
  isActive: isActiveSchema.optional(),
});

const needValidation = needSchema.parse;

module.exports = needValidation;
