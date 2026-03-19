# Retrieval System Architecture

## Overview

The retrieval system implements RAG (Retrieval Augmented Generation) for context-aware AI responses. It uses vector embeddings and semantic search to find relevant code chunks.

## Components

### 1. Code Chunking (`packages/retrieval/Chunker`)

Splits source code into semantic chunks:
- Configurable chunk size (default: 512 chars)
- Overlap between chunks (default: 50 chars)
- Syntax-aware chunking for supported languages
- Symbol extraction (functions, classes, variables)

**Supported Languages:**
- JavaScript/TypeScript (function and class boundaries)
- Python (function and class boundaries with indentation)
- Generic text-based chunking for others

### 2. Embedding Generation (`packages/retrieval/EmbeddingAdapter`)

Converts code chunks to vector embeddings:
- OpenAI text-embedding-3-small (1536 dimensions)
- Batch processing for efficiency
- Optional caching layer
- Configurable embedding model

### 3. Vector Storage (`packages/retrieval/VectorStore`)

Stores and searches vector embeddings:
- PostgreSQL with pgvector extension
- Cosine similarity search
- IVFFlat index for performance
- Metadata filtering (repository, language)

### 4. Reranking (`packages/retrieval/Reranker`)

Improves search relevance:
- Cohere Rerank API integration
- Local lexical reranker fallback
- Adjustable top-k results

## Retrieval Pipeline

```
User Query
    ↓
Query Embedding (OpenAI)
    ↓
Vector Search (pgvector, cosine similarity)
    ↓
Top K Results (e.g., 20)
    ↓
Reranking (Cohere)
    ↓
Top N Results (e.g., 5)
    ↓
Context for LLM
```

## Indexing Pipeline

```
Repository Added
    ↓
Worker: Scan Files
    ↓
Worker: Generate Chunks
    ↓
Worker: Generate Embeddings (batch)
    ↓
Worker: Store in Vector DB
    ↓
Indexing Complete
```

## Vector Search Query

```sql
SELECT 
  id,
  content,
  metadata,
  1 - (vector <=> $query_vector) as score
FROM code_chunks
WHERE metadata->>'repositoryId' = $repo_id
ORDER BY vector <=> $query_vector
LIMIT 20
```

## Performance Optimization

1. **Indexing:**
   - IVFFlat index with lists=100
   - Batch embedding generation
   - Async job processing

2. **Querying:**
   - Efficient vector operations
   - Metadata filtering before search
   - Result caching

3. **Storage:**
   - Compression for large embeddings
   - Partitioning by repository
   - Regular VACUUM and ANALYZE

## Metadata Schema

Each code chunk includes:
```json
{
  "language": "typescript",
  "filepath": "src/utils/helper.ts",
  "symbols": ["helperFunction", "HelperClass"],
  "repositoryId": "uuid",
  "fileId": "uuid"
}
```

## Search Filters

- Repository ID
- File path pattern
- Language
- Symbol names
- Date range
