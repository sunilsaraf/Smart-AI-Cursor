export class SearchService {
  async searchCode(query: string, options: any) {
    return { results: [], totalResults: 0 };
  }

  async semanticSearch(query: string, options: any) {
    return { results: [], totalResults: 0 };
  }

  async searchFiles(query: string, options: any) {
    return { results: [], totalResults: 0 };
  }
}

export const searchService = new SearchService();
