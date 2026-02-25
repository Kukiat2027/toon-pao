import { z } from "zod";
import { value } from "../value";

const calculateOperator = z.union([z.literal("+"), z.literal("-"), z.literal("*"), z.literal("/")]);

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
