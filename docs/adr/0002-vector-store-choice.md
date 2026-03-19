# ADR 0002: Vector Store Choice

## Status
Accepted

## Context
We need a vector database for storing and searching code embeddings. The system must support semantic search over millions of code chunks with low latency.

## Decision
We will use PostgreSQL with the pgvector extension as our vector store.

## Rationale

### Requirements
1. Vector similarity search (cosine distance)
2. Metadata filtering (repository, language, file path)
3. Scalability to millions of vectors
4. Low query latency (<100ms)
5. ACID compliance for metadata
6. Backup and recovery capabilities

### Alternatives Considered

1. **Pinecone**
   - ✅ Purpose-built for vectors
   - ✅ Fully managed, no ops overhead
   - ❌ External dependency, additional cost
   - ❌ Data leaves our infrastructure
   - ❌ Harder to join with relational data

2. **Weaviate**
   - ✅ Open source vector database
   - ✅ Great search features
   - ❌ Additional service to manage
   - ❌ More complex architecture
   - ❌ Separate from main database

3. **Qdrant**
   - ✅ High performance
   - ✅ Good filtering capabilities
   - ❌ Additional service to manage
   - ❌ Smaller ecosystem
   - ❌ Separate from main database

4. **PostgreSQL + pgvector** (chosen)
   - ✅ Single database for all data
   - ✅ ACID transactions
   - ✅ Existing expertise
   - ✅ Mature backup/recovery
   - ✅ Lower operational complexity
   - ✅ Cost-effective
   - ⚠️ May need optimization at scale

## Consequences

### Positive
- Simplified architecture (one database)
- Atomic updates to vectors and metadata
- Familiar SQL interface
- Easy backup and recovery
- Lower total cost of ownership

### Negative
- May need performance tuning at scale
- Vector operations slower than specialized DBs
- Index size can grow large

### Mitigations
- Use IVFFlat index for performance
- Regular VACUUM ANALYZE
- Monitor query performance
- Plan for potential migration if needed

## Performance Characteristics

### Benchmarks (pgvector 0.5.0)
- 1M vectors (1536 dims): ~50ms query time
- IVFFlat with lists=100: Good balance
- Cosine distance operator: `<=>`

### Index Configuration
```sql
CREATE INDEX code_chunks_embedding_idx 
ON code_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

## Migration Path
If we outgrow pgvector:
1. Benchmark at scale (>10M vectors)
2. Evaluate Pinecone or Qdrant
3. Implement dual-write during migration
4. Validate results
5. Switch over atomically

## Related Decisions
- ADR 0005: Embedding model choice
- ADR 0007: Chunking strategy
