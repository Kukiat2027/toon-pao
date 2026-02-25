import { DB } from "../constant/db";
import QdrantDB from "../db/qdrant";
import { addExpressionDocumentsToQdrant } from "./expression";
import { addValueDocumentsToQdrant } from "./value";

try {
  // await client.deleteCollection(DB.collection.vectorStore);
  const client = QdrantDB.connect()
  await client.deleteCollection(DB.collection.vectorStore);

  await addExpressionDocumentsToQdrant();
  await addValueDocumentsToQdrant();
} catch (error) {
  console.error(error);
  process.exit(1);
}