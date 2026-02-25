import { z } from "zod";
import { value } from "./value";

export const calculateOperator = z.union([z.literal("+"), z.literal("-"), z.literal("*"), z.literal("/")]);
export type TExpressionTerm = {
  operator: z.infer<typeof calculateOperator>;
  leftTerm: z.infer<typeof value> | TExpressionTerm;
  rightTerm: z.infer<typeof value> | TExpressionTerm;
};

export const baseExpressionTermSchema = z.object({
  operator: calculateOperator,
});

export const expressionTerm: z.ZodSchema<TExpressionTerm> = baseExpressionTermSchema.extend({
  leftTerm: z.union([value, z.lazy(() => expressionTerm)]),
  rightTerm: z.union([value, z.lazy(() => expressionTerm)]),
});

// ========= Expression Node for AI=========
export const expressionNode = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  position: z.enum(["left", "right"]).nullable(),
  type: z.enum(["operator", "value"]),
  operator: calculateOperator.nullable(),
  value: value.nullable(),
});
export const expression = z.array(expressionNode);

export type TExpressionNode = z.infer<typeof expressionNode>;
export type TExpression = z.infer<typeof expression>;
