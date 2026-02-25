import type { TValue } from "../schema/value";
import type { TExpression } from "../schema/expression";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantDB } from "../db/qdrant";

const value: TValue = {
  type: 'variable',
  val: '10',
  dataType: 'number'
}

// output for (10 + 10)
const simpleExpression: TExpression = [
  { id: "1", parentId: null, position: null, type: "operator", operator: "+", value: null },
  { id: "2", parentId: "1", position: "left", type: "value", operator: null, value },
  { id: "3", parentId: "1", position: "right", type: "value", operator: null, value },
];

// output for (10 + (10 + 10))
const nestedExpression1: TExpression = [
  { id: "1", parentId: null, position: null, type: "operator", operator: "+", value: null },
  { id: "2", parentId: "1", position: "left", type: "value", operator: null, value },
  { id: "3", parentId: "1", position: "right", type: "operator", operator: "+", value: null },
  { id: "4", parentId: "3", position: "left", type: "value", operator: null, value },
  { id: "5", parentId: "3", position: "right", type: "value", operator: null, value },
];

// output for ((10 + 10) + 10)
const nestedExpression2: TExpression = [
  { id: "1", parentId: null, position: null, type: "operator", operator: "+", value: null },
  { id: "2", parentId: "1", position: "left", type: "operator", operator: "+", value: null },
  { id: "3", parentId: "2", position: "left", type: "value", operator: null, value },
  { id: "4", parentId: "2", position: "right", type: "value", operator: null, value },
  { id: "5", parentId: "1", position: "right", type: "value", operator: null, value },
];

// output for ((10 + 10) + (10 + 10))
const nestedExpression3: TExpression = [
  { id: "1", parentId: null, position: null, type: "operator", operator: "+", value: null },
  { id: "2", parentId: "1", position: "left", type: "operator", operator: "+", value: null },
  { id: "3", parentId: "2", position: "left", type: "value", operator: null, value },
  { id: "4", parentId: "2", position: "right", type: "value", operator: null, value },
  { id: "5", parentId: "1", position: "right", type: "operator", operator: "+", value: null },
  { id: "6", parentId: "5", position: "left", type: "value", operator: null, value },
  { id: "7", parentId: "5", position: "right", type: "value", operator: null, value },
];

// output for (((10 + 10) + 10) + (10 + 10))
const nestedExpression4: TExpression = [
  { id: "1", parentId: null, position: null, type: "operator", operator: "+", value: null },
  { id: "2", parentId: "1", position: "left", type: "operator", operator: "+", value: null },
  { id: "3", parentId: "2", position: "left", type: "operator", operator: "+", value: null },
  { id: "4", parentId: "3", position: "left", type: "value", operator: null, value },
  { id: "5", parentId: "3", position: "right", type: "value", operator: null, value },
  { id: "6", parentId: "2", position: "right", type: "value", operator: null, value },
  { id: "7", parentId: "1", position: "right", type: "operator", operator: "+", value: null },
  { id: "8", parentId: "7", position: "left", type: "value", operator: null, value },
  { id: "9", parentId: "7", position: "right", type: "value", operator: null, value },
];

const expressionSeedDocuments: {
  id: string;
  text: string;
  expression: TExpression;
}[] = [
    {
      id: "simple-expression",
      text: "Simple expression (10 + 10)",
      expression: simpleExpression,
    },
    {
      id: "nested-expression-1",
      text: "Nested expression (10 + (10 + 10))",
      expression: nestedExpression1,
    },
    {
      id: "nested-expression-2",
      text: "Nested expression ((10 + 10) + 10)",
      expression: nestedExpression2,
    },
    {
      id: "nested-expression-3",
      text: "Nested expression ((10 + 10) + (10 + 10))",
      expression: nestedExpression3,
    },
    {
      id: "nested-expression-4",
      text: "Nested expression (((10 + 10) + 10) + (10 + 10))",
      expression: nestedExpression4,
    },
  ];

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function addExpressionDocumentsToQdrant(): Promise<void> {
  const collectionName = "expressions";
  const qdrantDB = new QdrantDB();
  const client = qdrantDB.connect();
  await QdrantVectorStore.fromTexts(
    expressionSeedDocuments.map((doc) => doc.text),
    expressionSeedDocuments.map((doc) => ({
      id: doc.id,
      expression: doc.expression,
    })),
    embeddings,
    {
      client: client!,
      collectionName,
    }
  );

  console.log(`Inserted ${expressionSeedDocuments.length} documents into ${collectionName}`);
}
