import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { DB } from "../constant/db";
import client from "../db/qdrant";
import type { TValue } from "../schema/value";

// output for single value 10
const simpleValue: TValue = {
  type: 'variable',
  val: '10',
  dataType: 'number'
}

const expressionSeedDocuments: {
  id: string;
  text: string;
  data: TValue;
}[] = [
    {
      id: "single-value",
      text: "Simple single value 10",
      data: simpleValue,
    }
  ];

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function addValueDocumentsToQdrant(): Promise<void> {
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
    console.log(`Inserted value ${expressionSeedDocuments.length} documents into ${collectionName}`);
  } catch (error) {
    console.error(`Error Inserted value documents to ${collectionName}:`, error);
  }
}
