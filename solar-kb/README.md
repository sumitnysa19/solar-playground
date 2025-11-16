Solar System Knowledge Base

Overview
- Purpose: High-quality, self-contained Markdown docs covering the Sun, planets, and the Moon for retrieval-augmented QA.
- Primary target: AWS Bedrock Knowledge Bases via S3 data source (Markdown ingestion).
- Secondary target: Local RAG or other vector DBs (same content works).

Structure
- `entities/` contains one Markdown file per body with concise facts, sections, and Q&A pairs.
- Each file uses YAML front matter for basic metadata (id, name, type, aliases, tags). Most RAG systems ingest it as plain text if unsupported.

Add Or Edit Content
- Duplicate `entities/template.md` and update the YAML fields and sections.
- Keep sections short, factual, and sourced from established references (NASA, ESA). Avoid speculation.
- Prefer SI units with common equivalents in parentheses.

Upload To Bedrock Knowledge Base (Console)
1) Create or choose an S3 bucket (e.g., `s3://your-bucket/solar-kb/`).
2) Upload the entire `solar-kb/` folder (or just `solar-kb/entities/`).
3) In AWS Console → Bedrock → Knowledge bases → Create knowledge base.
   - Data Source: S3, point to the bucket/prefix (e.g., `solar-kb/entities/`).
   - Content type: Markdown (detected automatically).
   - Embeddings model: pick your default (e.g., Titan or Cohere).
   - Index and create. Then run an ingestion sync.
4) Test with a retrieval-enabled Bedrock agent or the playground, asking questions like:
   - "What is Mercury’s orbital period?"
   - "Why is Uranus tilted?"
   - "Compare Jupiter and Saturn ring systems."

Notes
- If you need non-planet topics (asteroids, comets, Kuiper belt, missions, constellations), add new docs under `entities/` using the same template.
- If you later add a local retriever, these same files can be chunked or embedded as-is.

