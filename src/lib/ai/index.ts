import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { RetrievedExpressionDoc } from "../../model/retriever";
import { fieldSchema } from "../../schema/field";
import { buildContext } from "../../util/build-context";
import { toExpressionTerm } from "../../util/transform";
import type { TInput } from "../../schema/input";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new QdrantClient({ host: 'localhost', port: 6333 });
const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  client,
  collectionName: "expressions",
});

const llm = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
}).withStructuredOutput(fieldSchema);

export async function ask(userInput: TInput[]) {
  const detailInput = userInput.filter(t => t.type === 'detail').map(t => t.input).join('\n');
  const formulaInput = userInput.filter(t => t.type === 'formula').map(t => t.input).join('\n');

  const retriever = vectorStore.asRetriever({ k: 2 });
  const retrievedDocs = await retriever.invoke(formulaInput);

  const expressionDocs: RetrievedExpressionDoc[] = retrievedDocs.map((doc) => ({
    id: (doc.metadata?.id as string | number | undefined) ?? null,
    pageContent: doc.pageContent,
    expression: doc.metadata?.expression ?? null,
  }));

  const context = buildContext(expressionDocs);

  const generated = await llm.invoke([
    {
      role: "system",
      content: `
      You are an AI assistant that extracts a field structure with an embedded expression formula.

      **Field Structure Rules:**
      - uuid: generate using randomUUID (uuid v4)
      - displayName must be the same as name
      - parentId is null
      - type must be one of: string | number | boolean | date
      - If type is not one of the allowed types, throw an error

      **Expression Rules (populate inside rules[].formula):**
      - If the user provides formula input, create a rule entry with formula.type = "expression" and formula.code = the expression tree
      - Build the expression tree that best matches the formula input using the provided expression context
      - If no exact match, infer the closest valid expression from context
      - If no formula input is provided, return rules as an empty array

      Return a single field JSON object.`,
    },
    {
      role: "user",
      content: `
      **Detail Input (field structure):**
      ${detailInput}

      **Formula Input (expression):**
      ${formulaInput}

      **Expression Context:**
      ${context}`,
    },
  ]);

  return {
    ...generated,
    rules: generated.rules.map((rule) => {
      if (!rule.formula) return rule;
      return {
        ...rule,
        formula: {
          ...rule.formula,
          code: toExpressionTerm(rule.formula.code),
        },
      };
    }),
  };
}

// const result = await ask([
//   { type: 'detail', input: 'ฟิลชื่อ amount' },
//   { type: 'detail', input: 'มี data type เป็น number' },
//   { type: 'formula', input: 'จงสร้าง 1 + 8' },
// ]);

// console.log(JSON.stringify(result, null, 2));
