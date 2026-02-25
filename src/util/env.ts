let envSource = Bun.env;
const {
  OPENAI_API_KEY,
  QDRANT_HOST,
  QDRANT_API_KEY,
} = envSource;

export default {
  OPENAI_API_KEY,
  QDRANT_HOST,
  QDRANT_API_KEY,
};