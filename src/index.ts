import { swagger } from '@elysiajs/swagger';
import { Elysia } from "elysia";
import aiPlugin from "./plugin/ai";
import qdrantDB from "./db/qdrant";
import { logger } from "elysia-logger";

const app = new Elysia()
  .use(logger({
    logDetails: true,
  }))
  .decorate('qdrant', qdrantDB.connect())
  .use(swagger({
    documentation: {
      info: {
        title: 'ToonPao API',
        version: '1.0.0'
      }
    }
  }))
  .get("/", () => "Hello Elysia")
  .use(aiPlugin)
  .listen(3004);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
