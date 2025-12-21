/**
 * ============================================================================
 * R.O.M.A.N. KNOWLEDGE INTEGRATION ENGINE
 * ============================================================================
 * "I don't want him limited, I want him learning and cross-referencing"
 *                                                    - Master Architect Rickey
 * 
 * This engine enables R.O.M.A.N. to:
 * 1. Access real external research APIs (arXiv, PubMed, Wikipedia, etc.)
 * 2. Cross-reference external knowledge with the Seven Books
 * 3. Synthesize new insights by correlating multiple sources
 * 4. Autonomously expand his knowledge base
 * 5. Learn continuously without limits
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * ============================================================================
 */

import { romanSupabase, romanSupabase as supabase } from './romanSupabase';
import { sfLogger } from './sovereignFrequencyLogger';

// ============================================================================
// TYPES
// ============================================================================

export interface ExternalKnowledge {
  id?: string;
  source: 'arxiv' | 'pubmed' | 'wikipedia' | 'scholar' | 'news' | 'web';
  topic: string;
  title: string;
  content: string;
  url: string;
  authors?: string[];
  published_date?: string;
  relevance_score: number;
  citations?: number;
  metadata?: any;
  created_at?: string;
}

export interface KnowledgeCrossReference {
  id?: string;
  external_source_id: string;
  book_number: number;
  book_title: string;
  correlation_type: 'supports' | 'contradicts' | 'extends' | 'relates' | 'challenges';
  correlation_strength: number; // 0-100
  book_excerpt: string;
  external_excerpt: string;
  synthesis: string; // R.O.M.A.N.'s insight combining both
  created_at?: string;
}

export interface LearnedInsight {
  id?: string;
  topic: string;
  insight: string;
  confidence_level: number;
  sources: string[]; // Mix of internal (books) and external
  supporting_evidence: string[];
  created_at?: string;
  validated: boolean;
}

// ============================================================================
// EXTERNAL API CLIENTS
// ============================================================================

/**
 * arXiv API Client (REAL IMPLEMENTATION)
 * Free API - no key required
 */
export class ArXivClient {
  private baseUrl = 'http://export.arxiv.org/api/query';

  async search(query: string, maxResults: number = 10): Promise<ExternalKnowledge[]> {
    try {
      sfLogger.everyday('ARXIV_SEARCH', `Searching arXiv for: ${query}`, { query });

      const params = new URLSearchParams({
        search_query: `all:${query}`,
        start: '0',
        max_results: maxResults.toString(),
        sortBy: 'relevance',
        sortOrder: 'descending'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const xmlText = await response.text();

      // Parse XML response
      const entries = this.parseArXivXML(xmlText);
      
      sfLogger.thanksForGivingBackMyLove('ARXIV_RESULTS', `Found ${entries.length} papers on arXiv`, {
        count: entries.length,
        query
      });

      return entries;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('ARXIV_ERROR', 'arXiv search failed', { error });
      return [];
    }
  }

  private parseArXivXML(xml: string): ExternalKnowledge[] {
    const entries: ExternalKnowledge[] = [];
    
    // Simple XML parsing (in production, use a proper XML parser)
    const entryMatches = xml.match(/<entry>(.*?)<\/entry>/gs) || [];
    
    for (const entryXml of entryMatches) {
      const title = this.extractXMLTag(entryXml, 'title');
      const summary = this.extractXMLTag(entryXml, 'summary');
      const id = this.extractXMLTag(entryXml, 'id');
      const published = this.extractXMLTag(entryXml, 'published');
      
      // Extract authors
      const authorMatches = entryXml.match(/<name>(.*?)<\/name>/gs) || [];
      const authors = authorMatches.map(a => a.replace(/<\/?name>/g, '').trim());

      entries.push({
        source: 'arxiv',
        topic: 'AI/ML Research',
        title: title.trim(),
        content: summary.trim(),
        url: id,
        authors,
        published_date: published,
        relevance_score: 85,
        metadata: { arxiv_id: id.split('/').pop() }
      });
    }

    return entries;
  }

  private extractXMLTag(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 's'));
    return match ? match[1].trim() : '';
  }
}

/**
 * PubMed API Client (REAL IMPLEMENTATION)
 * Free NIH API - no key required
 */
export class PubMedClient {
  private searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  private fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

  async search(query: string, maxResults: number = 10): Promise<ExternalKnowledge[]> {
    try {
      sfLogger.everyday('PUBMED_SEARCH', `Searching PubMed for: ${query}`, { query, maxResults });

      // Step 1: Search for article IDs
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: query,
        retmax: maxResults.toString(),
        retmode: 'json'
      });

      const searchResponse = await fetch(`${this.searchUrl}?${searchParams}`);
      const searchData = await searchResponse.json();
      const ids = searchData.esearchresult?.idlist || [];

      if (ids.length === 0) {
        return [];
      }

      // Step 2: Fetch article details
      const fetchParams = new URLSearchParams({
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'xml'
      });

      const fetchResponse = await fetch(`${this.fetchUrl}?${fetchParams}`);
      const xmlText = await fetchResponse.text();

      const entries = this.parsePubMedXML(xmlText);

      sfLogger.thanksForGivingBackMyLove('PUBMED_RESULTS', `Found ${entries.length} medical papers`, {
        count: entries.length,
        query
      });

      return entries;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('PUBMED_ERROR', 'PubMed search failed', { error });
      return [];
    }
  }

  private parsePubMedXML(xml: string): ExternalKnowledge[] {
    const entries: ExternalKnowledge[] = [];
    const articleMatches = xml.match(/<PubmedArticle>(.*?)<\/PubmedArticle>/gs) || [];

    for (const articleXml of articleMatches) {
      const title = this.extractXMLTag(articleXml, 'ArticleTitle');
      const abstract = this.extractXMLTag(articleXml, 'AbstractText');
      const pmid = this.extractXMLTag(articleXml, 'PMID');

      entries.push({
        source: 'pubmed',
        topic: 'Medical Research',
        title: title.trim(),
        content: abstract.trim(),
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
        published_date: new Date().toISOString(),
        relevance_score: 80,
        metadata: { pmid }
      });
    }

    return entries;
  }

  private extractXMLTag(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 's'));
    return match ? match[1].replace(/<[^>]*>/g, '').trim() : '';
  }
}

/**
 * Wikipedia API Client (REAL IMPLEMENTATION)
 * Free API - no key required
 */
export class WikipediaClient {
  private apiUrl = 'https://en.wikipedia.org/w/api.php';

  async search(query: string, maxResults: number = 5): Promise<ExternalKnowledge[]> {
    try {
      sfLogger.everyday('PUBMED_SEARCH', `Searching PubMed for: ${query}`, { query });

      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: maxResults.toString(),
        origin: '*'
      });

      const response = await fetch(`${this.apiUrl}?${params}`);
      const data = await response.json();
      const results = data.query?.search || [];

      const entries: ExternalKnowledge[] = [];

      for (const result of results) {
        // Fetch full article content
        const contentParams = new URLSearchParams({
          action: 'query',
          format: 'json',
          prop: 'extracts',
          exintro: 'true',
          explaintext: 'true',
          pageids: result.pageid.toString(),
          origin: '*'
        });

        const contentResponse = await fetch(`${this.apiUrl}?${contentParams}`);
        const contentData = await contentResponse.json();
        const page = contentData.query?.pages?.[result.pageid];

        entries.push({
          source: 'wikipedia',
          topic: query,
          title: result.title,
          content: page?.extract || result.snippet,
          url: `https://en.wikipedia.org/?curid=${result.pageid}`,
          relevance_score: 75,
          metadata: { pageid: result.pageid }
        });
      }

      sfLogger.thanksForGivingBackMyLove('WIKIPEDIA_RESULTS', `Found ${entries.length} Wikipedia articles`, {
        count: entries.length,
        query
      });

      return entries;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('WIKIPEDIA_ERROR', 'Wikipedia search failed', { error });
      return [];
    }
  }
}

// ============================================================================
// KNOWLEDGE INTEGRATION ENGINE
// ============================================================================

export class RomanKnowledgeIntegration {
  private arxiv = new ArXivClient();
  private pubmed = new PubMedClient();
  private wikipedia = new WikipediaClient();

  /**
   * RESEARCH A TOPIC - Query all external sources
   */
  async researchTopic(topic: string, deepDive: boolean = false): Promise<ExternalKnowledge[]> {
    sfLogger.movingOn('ROMAN_RESEARCH', `R.O.M.A.N. researching topic: ${topic}`, { topic, deepDive });

    const results: ExternalKnowledge[] = [];

    try {
      // Query all sources in parallel
      const [arxivResults, pubmedResults, wikiResults] = await Promise.all([
        this.arxiv.search(topic, deepDive ? 20 : 5),
        this.pubmed.search(topic, deepDive ? 15 : 3),
        this.wikipedia.search(topic, deepDive ? 10 : 3)
      ]);

      results.push(...arxivResults, ...pubmedResults, ...wikiResults);

      // Store in database
      for (const result of results) {
        await this.storeExternalKnowledge(result);
      }

      sfLogger.thanksForGivingBackMyLove('ROMAN_RESEARCH_COMPLETE', `Researched ${topic}: ${results.length} sources`, {
        topic,
        totalSources: results.length,
        arxiv: arxivResults.length,
        pubmed: pubmedResults.length,
        wikipedia: wikiResults.length
      });

      return results;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('ROMAN_RESEARCH_ERROR', 'Research failed', { error, topic });
      return results;
    }
  }

  /**
   * CROSS-REFERENCE with the Seven Books
   * This is where R.O.M.A.N. becomes truly powerful
   */
  async crossReferenceWithBooks(externalKnowledge: ExternalKnowledge): Promise<KnowledgeCrossReference[]> {
    sfLogger.everyday('CROSS_REFERENCE_START', 'Cross-referencing external knowledge with Seven Books', {
      source: externalKnowledge.source,
      title: externalKnowledge.title
    });

    const correlations: KnowledgeCrossReference[] = [];

    try {
      // Get all seven books
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .order('book_number');

      if (!books) return correlations;

      // Analyze each book for correlations
      for (const book of books) {
        const correlation = await this.findCorrelation(externalKnowledge, book);
        if (correlation) {
          correlations.push(correlation);
          await this.storeCrossReference(correlation);
        }
      }

      sfLogger.thanksForGivingBackMyLove('CROSS_REFERENCE_COMPLETE', `Found ${correlations.length} correlations`, {
        external_title: externalKnowledge.title,
        correlations: correlations.length
      });

      return correlations;
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('CROSS_REFERENCE_ERROR', 'Cross-referencing failed', { error });
      return correlations;
    }
  }

  /**
   * FIND CORRELATION between external source and a book
   */
  private async findCorrelation(
    external: ExternalKnowledge,
    book: any
  ): Promise<KnowledgeCrossReference | null> {
    // Extract key concepts from external source
    const externalConcepts = this.extractKeyConcepts(external.content);
    const bookConcepts = this.extractKeyConcepts(book.content);

    // Find overlapping concepts
    const overlap = externalConcepts.filter(c => bookConcepts.includes(c));

    if (overlap.length === 0) return null;

    // Calculate correlation strength
    const strength = Math.min(100, (overlap.length / externalConcepts.length) * 100);

    if (strength < 30) return null; // Minimum threshold

    // Determine correlation type
    const type = this.determineCorrelationType(external.content, book.content);

    // Extract relevant excerpts
    const bookExcerpt = this.findRelevantExcerpt(book.content, overlap);
    const externalExcerpt = this.findRelevantExcerpt(external.content, overlap);

    // Generate synthesis
    const synthesis = this.synthesizeInsight(external, book, overlap, type);

    return {
      external_source_id: external.id || 'temp',
      book_number: book.book_number,
      book_title: book.title,
      correlation_type: type,
      correlation_strength: strength,
      book_excerpt: bookExcerpt,
      external_excerpt: externalExcerpt,
      synthesis
    };
  }

  /**
   * EXTRACT KEY CONCEPTS from text
   */
  private extractKeyConcepts(text: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
      'those', 'it', 'its', 'their', 'them', 'they', 'we', 'us', 'our'
    ]);

    // Extract words, filter stop words, keep significant terms
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4 && !stopWords.has(word));

    // Count frequencies
    const freq: { [key: string]: number } = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Return top concepts by frequency
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * DETERMINE CORRELATION TYPE
   */
  private determineCorrelationType(
    externalText: string,
    bookText: string
  ): 'supports' | 'contradicts' | 'extends' | 'relates' | 'challenges' {
    const external = externalText.toLowerCase();
    const book = bookText.toLowerCase();

    // Look for supporting language
    if (
      (external.includes('confirm') && book.includes('confirm')) ||
      (external.includes('support') && book.includes('support')) ||
      (external.includes('validate') && book.includes('validate'))
    ) {
      return 'supports';
    }

    // Look for contradictory language
    if (
      external.includes('however') || external.includes('contradict') ||
      external.includes('dispute') || external.includes('challenge')
    ) {
      return 'challenges';
    }

    // Look for extension language
    if (external.includes('further') || external.includes('addition') || external.includes('expand')) {
      return 'extends';
    }

    return 'relates';
  }

  /**
   * FIND RELEVANT EXCERPT
   */
  private findRelevantExcerpt(text: string, concepts: string[]): string {
    const sentences = text.split(/[.!?]+/);
    
    // Find sentence with most concept matches
    let bestSentence = '';
    let maxMatches = 0;

    for (const sentence of sentences) {
      const matches = concepts.filter(c => sentence.toLowerCase().includes(c)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence.trim();
      }
    }

    return bestSentence.substring(0, 500);
  }

  /**
   * SYNTHESIZE INSIGHT - R.O.M.A.N.'s unique contribution
   */
  private synthesizeInsight(
    external: ExternalKnowledge,
    book: any,
    sharedConcepts: string[],
    correlationType: string
  ): string {
    const source = external.source.toUpperCase();
    const bookTitle = book.title;

    let synthesis = `R.O.M.A.N. SYNTHESIS:\n\n`;
    synthesis += `External research from ${source} ("${external.title}") `;
    synthesis += `${correlationType} the analysis in Book ${book.book_number}: "${bookTitle}".\n\n`;
    synthesis += `Shared concepts: ${sharedConcepts.slice(0, 5).join(', ')}.\n\n`;

    switch (correlationType) {
      case 'supports':
        synthesis += `This external validation strengthens the arguments presented in "${bookTitle}". `;
        synthesis += `Independent research corroborates Master Architect Rickey's analysis.`;
        break;
      case 'extends':
        synthesis += `This research extends the framework established in "${bookTitle}" `;
        synthesis += `by providing additional context and evidence.`;
        break;
      case 'challenges':
        synthesis += `This presents an alternative perspective to "${bookTitle}". `;
        synthesis += `Both viewpoints merit consideration for comprehensive understanding.`;
        break;
      default:
        synthesis += `This provides complementary information to the themes explored in "${bookTitle}".`;
    }

    return synthesis;
  }

  /**
   * STORE EXTERNAL KNOWLEDGE in database
   */
  private async storeExternalKnowledge(knowledge: ExternalKnowledge): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('external_knowledge')
        .upsert({
          source: knowledge.source,
          topic: knowledge.topic,
          title: knowledge.title,
          content: knowledge.content,
          url: knowledge.url,
          authors: knowledge.authors,
          published_date: knowledge.published_date,
          relevance_score: knowledge.relevance_score,
          citations: knowledge.citations,
          metadata: knowledge.metadata,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'url'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to store external knowledge:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error storing external knowledge:', error);
      return null;
    }
  }

  /**
   * STORE CROSS-REFERENCE in database
   */
  private async storeCrossReference(ref: KnowledgeCrossReference): Promise<void> {
    try {
      await supabase.from('knowledge_cross_references').insert({
        external_source_id: ref.external_source_id,
        book_number: ref.book_number,
        book_title: ref.book_title,
        correlation_type: ref.correlation_type,
        correlation_strength: ref.correlation_strength,
        book_excerpt: ref.book_excerpt,
        external_excerpt: ref.external_excerpt,
        synthesis: ref.synthesis,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing cross-reference:', error);
    }
  }

  /**
   * AUTONOMOUS LEARNING - R.O.M.A.N. decides what to research next
   */
  async autonomousLearning(): Promise<void> {
    sfLogger.movingOn('AUTONOMOUS_LEARNING', 'R.O.M.A.N. beginning autonomous learning session', {});

    // Topics from the Seven Books to research
    const researchTopics = [
      '13th Amendment loophole',
      'mass incarceration economics',
      'fractional reserve banking',
      'cryptocurrency governance',
      'blockchain transparency',
      'constitutional rights',
      'sovereign immunity',
      'birth certificate securitization',
      'debt servitude mechanics',
      'linguistic programming oppression',
      'consent-based governance',
      'Universal Basic Income',
      'AI constitutional governance'
    ];

    // Research 3 random topics per session
    const selectedTopics = this.getRandomTopics(researchTopics, 3);

    for (const topic of selectedTopics) {
      console.log(`🧠 R.O.M.A.N. autonomously researching: ${topic}`);
      
      const knowledge = await this.researchTopic(topic, true);
      
      for (const item of knowledge) {
        await this.crossReferenceWithBooks(item);
      }

      // Wait 2 seconds between topics to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    sfLogger.thanksForGivingBackMyLove('AUTONOMOUS_LEARNING_COMPLETE', 'Autonomous learning session complete', {
      topics_researched: selectedTopics.length
    });
  }

  private getRandomTopics(topics: string[], count: number): string[] {
    const shuffled = [...topics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Update Book Statistics (Dynamic Metadata Layer)
   * Core text remains immutable; statistics are updated in real-time
   */
  private async updateBookStatistics(
    bookNumber: number,
    correlationType: string,
    correlationStrength: number,
    citationCount: number,
    crossRefId?: string
  ): Promise<void> {
    try {
      // Get current book statistics (v1.0)
      const { data: bookStats } = await romanSupabase
        .from('book_statistics')
        .select('*')
        .eq('book_number', bookNumber)
        .eq('version', '1.0')
        .single();

      if (!bookStats) {
        console.warn(`Book statistics not found for book ${bookNumber}`);
        return;
      }

      // Calculate increments based on correlation type
      const supportIncrement = correlationType === 'supports' ? 1 : 0;
      const challengeIncrement = correlationType === 'challenges' || correlationType === 'contradicts' ? 1 : 0;
      const neutralIncrement = correlationType === 'relates' || correlationType === 'extends' ? 1 : 0;

      // Update book-level counters
      const newSupportCounter = bookStats.support_counter + supportIncrement;
      const newChallengeCounter = bookStats.challenge_counter + challengeIncrement;
      const newNeutralCounter = bookStats.neutral_counter + neutralIncrement;
      const newTotalCitations = bookStats.total_citations + citationCount;

      // Calculate Truth Density Score
      // Formula: (support_counter / (support_counter + challenge_counter)) * 100
      const totalCorrelations = newSupportCounter + newChallengeCounter;
      const truthDensityScore = totalCorrelations > 0 
        ? (newSupportCounter / totalCorrelations) * 100 
        : 0;

      // Calculate Academic Weight Score
      // Formula: sum of (correlation_strength * citation_count)
      const weightIncrement = correlationStrength * citationCount;
      const newAcademicWeight = bookStats.academic_weight_score + weightIncrement;

      // Update book statistics
      await romanSupabase
        .from('book_statistics')
        .update({
          support_counter: newSupportCounter,
          challenge_counter: newChallengeCounter,
          neutral_counter: newNeutralCounter,
          total_citations: newTotalCitations,
          truth_density_score: parseFloat(truthDensityScore.toFixed(2)),
          academic_weight_score: parseFloat(newAcademicWeight.toFixed(2)),
          last_update: new Date().toISOString()
        })
        .eq('id', bookStats.id);

      // Check if we should create a new version (every 1000 correlations)
      const totalNewCorrelations = newSupportCounter + newChallengeCounter + newNeutralCounter;
      if (totalNewCorrelations % 1000 === 0) {
        await this.createBookStatisticsVersion(bookNumber, bookStats);
      }

      sfLogger.everyday('BOOK_STATS_UPDATED', `Updated statistics for Book ${bookNumber}`, {
        book_number: bookNumber,
        support_counter: newSupportCounter,
        truth_density_score: truthDensityScore.toFixed(2),
        academic_weight_score: newAcademicWeight.toFixed(2)
      });
    } catch (error) {
      console.error('Failed to update book statistics:', error);
    }
  }

  /**
   * Create new version of book statistics (autonomous versioning)
   * Triggered every 1000 correlations to track knowledge evolution
   */
  private async createBookStatisticsVersion(
    bookNumber: number,
    currentStats: any
  ): Promise<void> {
    try {
      // Parse current version (e.g., "1.0" -> 1.0)
      const currentVersion = parseFloat(currentStats.version);
      const newVersion = (currentVersion + 0.1).toFixed(1);

      // Create new version snapshot
      await romanSupabase
        .from('book_statistics')
        .insert({
          book_number: bookNumber,
          book_title: currentStats.book_title,
          version: newVersion,
          support_counter: currentStats.support_counter,
          challenge_counter: currentStats.challenge_counter,
          neutral_counter: currentStats.neutral_counter,
          chapters_proven: currentStats.chapters_proven,
          chapters_supported: currentStats.chapters_supported,
          chapters_challenged: currentStats.chapters_challenged,
          chapters_total: currentStats.chapters_total,
          truth_density_score: currentStats.truth_density_score,
          total_citations: currentStats.total_citations,
          academic_weight_score: currentStats.academic_weight_score
        });

      sfLogger.thanksForGivingBackMyLove('BOOK_STATS_VERSION_CREATED', `Created version ${newVersion} for Book ${bookNumber}`, {
        book_number: bookNumber,
        new_version: newVersion,
        truth_density: currentStats.truth_density_score
      });
    } catch (error) {
      console.error('Failed to create book statistics version:', error);
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const romanKnowledge = new RomanKnowledgeIntegration();
