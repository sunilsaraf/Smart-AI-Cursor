export class IndexingService {
  async triggerIndexing(repositoryId: string) {
    return { jobId: 'mock-job-id', repositoryId };
  }

  async getIndexingStatus(repositoryId: string) {
    return {
      repositoryId,
      status: 'completed',
      progress: 100,
      filesProcessed: 0,
      totalFiles: 0,
      chunksGenerated: 0,
    };
  }
}

export const indexingService = new IndexingService();
