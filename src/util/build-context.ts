import type { RetrievedExpressionDoc } from "../model/retriever";

export function buildContext(docs: RetrievedExpressionDoc[]): string {
  if (docs.length === 0) {
    return "No relevant context found in vector store.";
  }

  return docs
    .map(
      (doc, index) => `
        Document ${index + 1}
        id: ${String(doc.id)}
        text: ${doc.pageContent}
        expression: ${JSON.stringify(doc.expression)}`
    )
    .join("\n\n");
}
