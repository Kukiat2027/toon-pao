import { z } from "zod";
import { value } from "./value";

const calculateOperator = z.enum(["+", "-", "*", "/"]);

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
