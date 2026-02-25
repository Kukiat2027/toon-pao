import { Elysia, t } from "elysia";
import { ask } from "../lib/ai";

const aiPlugin = new Elysia({ prefix: "/ai" })
  .post("/ask", ({ body }) => {
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

export default aiPlugin;