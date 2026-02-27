import { createAgent } from "langchain";
import { fieldSchema } from "../../schema/field";
import type { TInput } from "../../schema/input";
import { toExpressionTerm } from "../../util/transform";
import { searchFormulaTool } from "./tool/searchFormula";

const systemPrompt = `
You are an AI assistant that extracts a field structure with an embedded expression formula.

**Field Structure Rules:**
- id: generate using randomUUID (uuid v4)
- uuid: generate using randomUUID (uuid v4)
- displayName must be the same as name
- parentId is null
- format date should be localized formats from DayJS
- type must be one of: string | number | boolean | date
- If type is not one of the allowed types, throw an error

**Simple Value Rules (populate inside rules[].formula):**
- If the user provides simple value input, create a rule entry with formula.type = "value" and formula.code = the value
- If no simple value input is provided, return rules as an empty array

**Expression Rules (populate inside rules[].formula):**
- If the user provides formula input, use the search_formula_context tool to retrieve relevant expression patterns first
- Then create a rule entry with formula.type = "expression" and formula.code = the expression tree
- isGlobal should be true when has formula input
- Build the expression tree that best matches the formula input using the retrieved expression context
- If no exact match, infer the closest valid expression from context
- If no formula input is provided, return rules as an empty array

Return a single field JSON object.`;

const agent = createAgent({
  model: "gpt-4.1-mini",
  systemPrompt,
  responseFormat: fieldSchema,
  tools: [searchFormulaTool],
});

export async function ask(userInput: TInput[]) {
  const detailInput = userInput.filter(t => t.type === 'detail').map(t => t.input).join('\n');
  const formulaInput = userInput.filter(t => t.type === 'formula').map(t => t.input).join('\n');

  const generated = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `
        **Detail Input (field structure):**
        ${detailInput}

        **Formula Input (expression):**
        ${formulaInput}`,
      },
    ],
  });

  console.log('generated', JSON.stringify(generated, null, 2));

  return {
    ...generated.structuredResponse,
    rules: generated.structuredResponse?.rules.map((rule) => {
      if (!rule.formula) return rule;
      return {
        ...rule,
        formula: {
          ...rule.formula,
          code: (() => {
            switch (rule.formula.type) {
              case "expression":
                return toExpressionTerm(rule.formula.code);
              case "value":
                return rule.formula.code;
              default:
                return null;
            }
          })(),
        },
      };
    }),
  };
}
