import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { DB } from "../constant/db";
import client from "../db/qdrant";
import type { TExpression } from "../schema/expression";
import type { TValue } from "../schema/value";

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
  data: TExpression;
}[] = [
    {
      id: "simple-expression",
      text: "Simple expression (10 + 10)",
      data: simpleExpression,
    },
    {
      id: "nested-expression-1",
      text: "Nested expression (10 + (10 + 10))",
      data: nestedExpression1,
    },
    {
      id: "nested-expression-2",
      text: "Nested expression ((10 + 10) + 10)",
      data: nestedExpression2,
    },
    {
      id: "nested-expression-3",
      text: "Nested expression ((10 + 10) + (10 + 10))",
      data: nestedExpression3,
    },
    {
      id: "nested-expression-4",
      text: "Nested expression (((10 + 10) + 10) + (10 + 10))",
      data: nestedExpression4,
    },
  ];

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function addExpressionDocumentsToQdrant(): Promise<void> {
  const collectionName = DB.collection.vectorStore;

  try {
    await QdrantVectorStore.fromTexts(
      expressionSeedDocuments.map((doc) => doc.text),
      expressionSeedDocuments.map((doc) => ({
        id: doc.id,
        data: doc.data,
      })),
      embeddings,
      {
        client: client.getClient()!,
        collectionName,
      }
    );
    console.log(`Inserted expression ${expressionSeedDocuments.length} documents into ${collectionName}`);
  } catch (error) {
    console.error(`Error Inserted expression documents to ${collectionName}:`, error);
  }
}
