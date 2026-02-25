import { DocumentInterface } from "@langchain/core/documents";

export function buildContext(docs: DocumentInterface<Record<string, any>>[]): string {
  if (docs.length === 0) {
    return "No relevant context found in vector store.";
  }

  return docs
    .map(
      (doc, index) => `
        Document ${index + 1}
        id: ${String(doc.metadata.id)}
        text: ${doc.pageContent}
        Formula: ${doc.metadata ? JSON.stringify(doc.metadata.data) : null}`
    )
    .join("\n\n");
}
