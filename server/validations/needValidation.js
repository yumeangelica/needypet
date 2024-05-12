const { z } = require('zod');

const dateForSchema = z.date({
  dateFor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const categorySchema = z.string({
  category: z.string().min(3).max(50),
});

const descriptionSchema = z.string({
  description: z.string().max(1000),
});

const timesSchema = z.number({
  times: z.number().min(1),
});

const periodicityUnitSchema = z.string({
  unit: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
});

const periodicityIntervalSchema = z.number({
  interval: z.number().min(1),
});

const periodicityCustomIntervalDaysSchema = z.number({
  customIntervalDays: z.number().min(1),
});

const periodicityStartDateSchema = z.date({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
});

const periodicityEndDateSchema = z.date({
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
});

const periodicityNextReminderSchema = z.date({
  nextReminder: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
});

const periodicityActiveSchema = z.boolean({
  active: z.boolean(),
});

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

const completedSchema = z.boolean({
  completed: z.boolean(),
});

const archivedSchema = z.boolean({
  archived: z.boolean(),
});

const isActiveSchema = z.boolean({
  isActive: z.boolean(),
});

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
