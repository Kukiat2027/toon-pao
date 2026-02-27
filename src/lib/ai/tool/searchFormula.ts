import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { tool } from "langchain";
import { z } from "zod";
import { DB } from "../../../constant/db";
import qdrantDB from "../../../db/qdrant";
import { buildContext } from "../../../util/build-context";
import env from "../../../util/env";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: env.OPENAI_API_KEY,
});

const SCORE_THRESHOLD = 0.4;

export const searchFormulaTool = tool(
  async ({ query }) => {
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      client: qdrantDB.getClient()!,
      collectionName: DB.collection.vectorStore,
    });
    const resultsWithScores = await vectorStore.similaritySearchWithScore(query, 2);

    const results = resultsWithScores
      .filter(([, score]) => score >= SCORE_THRESHOLD)
      .map(([doc]) => doc);

    if (results.length === 0) {
      return "No relevant formula context found. Return rules as an empty array.";
    }

    return buildContext(results);
  },
  {
    name: "search_formula_context",
    description:
      "Search the vector store for expression formula context relevant to the given query. Use this when the user provides formula input to find matching expression patterns.",
    schema: z.object({
      query: z.string().describe("The formula query to search for"),
    }),
  }
);
