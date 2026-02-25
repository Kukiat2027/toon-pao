import { Elysia, t } from "elysia";
import { ask } from "./ai";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .post("/ai", ({ body }) => {
    return ask(
      body.inputs.map(i => ({ type: i.type, input: i.input }))
    );
  }, {
    body: t.Object({
      inputs: t.Array(t.Object({
        type: t.Union([t.Literal('detail'), t.Literal('formula')]),
        input: t.String(),
      })),
    }),
  })
  .listen(3004);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
