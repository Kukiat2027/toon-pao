import { QdrantClient } from "@qdrant/js-client-rest";
import env from "../util/env";

export class QdrantDB {
  private instance: QdrantClient | null = null;

  connect(): QdrantClient {
    if (!this.instance) {
      console.log('Connecting to Qdrant database...');
      this.instance = new QdrantClient({
        url: env.QDRANT_HOST,
        apiKey: env.QDRANT_API_KEY,
      });
      console.log('Connected to Qdrant database');
    }
    return this.instance;
  }

  getClient(): QdrantClient | null {
    return this.instance;
  }
}

export default new QdrantDB();
