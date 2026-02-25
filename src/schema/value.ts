import { z } from "zod";

export const value = z.object({
  type: z.enum(['variable', 'field', 'master']),
  val: z.string(),
  dataType: z.enum(['string', 'number', 'boolean', 'date']),
})

export type TValue = z.infer<typeof value>;
