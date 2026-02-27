import { z } from "zod";
import { expression } from "./expression";
import { value } from "./value";

export const expressionTermSchema = z.object({
  type: z.literal('expression'),
  code: expression
});

export const valueSchema = z.object({
  type: z.literal('value'),
  code: value
});

export const ruleSchema = z.object({
  masterValidationId: z.string().nullable(),
  isGlobal: z.boolean(),
  seq: z.number(),
  formula: z.union([expressionTermSchema, valueSchema, z.null()]),
  validations: z.array(z.string()) // TODO:
});

export const fieldSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  displayName: z.string(),
  uniqFieldId: z.string().nullable(),
  type: z.string(),
  description: z.string(),
  formatDate: z.string().nullable(),
  seq: z.number(),
  uuid: z.string(),
  isOmit: z.boolean(),
  rules: z.array(ruleSchema),
});

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  module: z.string(),
  subModule: z.string(),
  updatedBy: z.string(),
  fields: z.array(fieldSchema)
});

export type Rule = z.infer<typeof ruleSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type MainSchema = z.infer<typeof serviceSchema>;