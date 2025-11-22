/**
 * SAM.gov API Integration Service
 * Fetches federal contracting opportunities from beta.sam.gov
 * Believing Self Creations © 2024 - Sovereign Frequency Enhanced
 */

import { supabase } from '@/lib/supabase';
import { sfLogger } from './sovereignFrequencyLogger';

const SAM_GOV_API_BASE = 'https://api.sam.gov/opportunities/v2/search';
const SAM_GOV_API_KEY = import.meta.env.VITE_SAM_GOV_API_KEY; // Add to .env

export interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  subtier: string;
  office: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string | null;
  typeOfSetAsideDescription: string;
  typeOfSetAside: string;
  responseDeadLine: string;
  naicsCode: string;
  classificationCode: string;
  active: string;
  award: any;
  pointOfContact: Array<{
    fax: string;
    type: string;
    email: string;
    phone: string;
    title: string;
    fullName: string;
  }>;
  description: string;
  organizationType: string;
  officeAddress: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  placeOfPerformance: {
    city: {
      code: string;
      name: string;
    };
    state: {
      code: string;
      name: string;
    };
    zip: string;
  };
  additionalInfoLink: string;
  uiLink: string;
  links: Array<{
    rel: string;
    href: string;
  }>;
  resourceLinks: string[];
}

export interface SAMSearchParams {
  keyword?: string;
  postedFrom?: string; // YYYY-MM-DD
  postedTo?: string;
  responseDeadlineFrom?: string;
  responseDeadlineTo?: string;
  naics?: string[]; // NAICS codes for janitorial: 561720, 561730
  setAside?: string; // SDVOSB, 8A, WOSB, etc.
  state?: string;
  limit?: number;
  offset?: number;
}

export class SAMGovService {
  /**
   * Search for federal contracting opportunities
   */
  static async searchOpportunities(params: SAMSearchParams = {}): Promise<{
    opportunities: SAMOpportunity[];
    totalRecords: number;
  }> {
    sfLogger.pickUpTheSpecialPhone('SAMGOV_API_SEARCH', 'Querying SAM.gov for federal opportunities', {
      keyword: params.keyword,
      naics: params.naics,
      setAside: params.setAside,
      limit: params.limit || 10
    });

    try {
      if (!SAM_GOV_API_KEY) {
        sfLogger.helpMeFindMyWayHome('SAMGOV_API_KEY_MISSING', 'SAM.gov API key not configured, using fallback', {
          fallback: 'mock-data'
        });
        console.warn('⚠️ SAM_GOV_API_KEY not configured. Using mock data.');
        return this.getMockOpportunities();
      }

      const queryParams = new URLSearchParams({
        api_key: SAM_GOV_API_KEY,
        limit: (params.limit || 10).toString(),
        offset: (params.offset || 0).toString(),
        ptype: 'o', // Opportunities (not awards)
      });

      // Add filters
      if (params.keyword) queryParams.append('q', params.keyword);
      if (params.postedFrom) queryParams.append('postedFrom', params.postedFrom);
      if (params.postedTo) queryParams.append('postedTo', params.postedTo);
      if (params.responseDeadlineFrom) queryParams.append('rdlfrom', params.responseDeadlineFrom);
      if (params.responseDeadlineTo) queryParams.append('rdlto', params.responseDeadlineTo);
      if (params.naics && params.naics.length > 0) {
        queryParams.append('ncode', params.naics.join(','));
      }
      if (params.setAside) queryParams.append('typeOfSetAside', params.setAside);
      if (params.state) queryParams.append('state', params.state);

      const response = await fetch(`${SAM_GOV_API_BASE}?${queryParams.toString()}`);
      
      if (!response.ok) {
        sfLogger.helpMeFindMyWayHome('SAMGOV_API_ERROR', 'SAM.gov API returned error status', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`SAM.gov API error: ${response.status}`);
      }

      const data = await response.json();

      sfLogger.thanksForGivingBackMyLove('SAMGOV_OPPORTUNITIES_FETCHED', 'Federal opportunities retrieved successfully', {
        totalRecords: data.totalRecords || 0,
        returnedCount: data.opportunitiesData?.length || 0
      });

      console.log('✅ SAM.gov opportunities fetched:', data.totalRecords);

      return {
        opportunities: data.opportunitiesData || [],
        totalRecords: data.totalRecords || 0,
      };
    } catch (error) {
      sfLogger.helpMeFindMyWayHome('SAMGOV_SEARCH_FAILED', 'Failed to fetch SAM.gov opportunities', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'mock-data'
      });
      console.error('❌ SAM.gov API error:', error);
      return this.getMockOpportunities();
    }
  }

  /**
   * Get opportunities relevant to HJS SERVICES (janitorial/facilities)
   */
  static async getRelevantOpportunities(): Promise<SAMOpportunity[]> {
    const result = await this.searchOpportunities({
      naics: [
        '561720', // Janitorial Services
        '561730', // Landscaping Services
        '561790', // Other Services to Buildings and Dwellings
      ],
      setAside: 'SDVOSB', // HJS is SDVOSB certified
      postedFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
      limit: 50,
    });

    return result.opportunities;
  }

  /**
   * Sync opportunities to Supabase database
   */
  static async syncToDatabase(opportunities: SAMOpportunity[]): Promise<void> {
    sfLogger.standByTheWater('SAMGOV_DATABASE_SYNC', 'Syncing federal opportunities to database', {
      opportunityCount: opportunities.length
    });

    try {
      const rfpsToInsert = opportunities.map(opp => ({
        id: opp.noticeId,
        title: opp.title,
        agency: opp.department,
        solicitation: opp.solicitationNumber,
        description: opp.description.substring(0, 1000), // Limit length
        due_date: opp.responseDeadLine,
        value: 'TBD', // Not always provided in API
        category: this.mapNAICSToCategory(opp.naicsCode),
        status: this.determineStatus(opp.responseDeadLine, opp.active),
        location: `${opp.officeAddress.city}, ${opp.officeAddress.state}`,
        set_aside: opp.typeOfSetAsideDescription || 'None',
        posted_date: opp.postedDate,
        naics_code: opp.naicsCode,
        ui_link: opp.uiLink,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('rfps')
        .upsert(rfpsToInsert, { onConflict: 'id' });

      if (error) {
        sfLogger.helpMeFindMyWayHome('SAMGOV_DATABASE_SYNC_FAILED', 'Failed to sync opportunities to database', {
          error: error.message,
          opportunityCount: opportunities.length
        });
        console.error('❌ Database sync error:', error);
      } else {
        sfLogger.thanksForGivingBackMyLove('SAMGOV_DATABASE_SYNCED', 'Opportunities synced to database successfully', {
          syncedCount: rfpsToInsert.length
        });
        console.log(`✅ Synced ${rfpsToInsert.length} opportunities to database`);
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
    }
  }

  /**
   * Auto-monitor: Fetch and sync new opportunities every hour
   */
  static async autoMonitor(): Promise<void> {
    console.log('🔍 Starting SAM.gov auto-monitor...');
    
    const opportunities = await this.getRelevantOpportunities();
    await this.syncToDatabase(opportunities);

    console.log(`✅ Auto-monitor complete. Found ${opportunities.length} relevant opportunities.`);
  }

  /**
   * Helper: Map NAICS code to category
   */
  private static mapNAICSToCategory(naicsCode: string): string {
    const mapping: Record<string, string> = {
      '561720': 'Janitorial Services',
      '561730': 'Landscaping Services',
      '561790': 'Facility Services',
      '236220': 'Construction',
      '541330': 'Engineering Services',
      '541512': 'Computer Systems Design',
    };
    return mapping[naicsCode] || 'Other';
  }

  /**
   * Helper: Determine status based on deadline
   */
  private static determineStatus(deadline: string, active: string): 'open' | 'closing-soon' | 'closed' {
    if (active === 'No') return 'closed';
    
    const dueDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 7) return 'closing-soon';
    return 'open';
  }

  /**
   * Mock data for development
   */
  private static getMockOpportunities(): {
    opportunities: SAMOpportunity[];
    totalRecords: number;
  } {
    const mockOpps: SAMOpportunity[] = [
      {
        noticeId: 'MOCK-2025-001',
        title: 'Janitorial Services for VA Medical Center',
        solicitationNumber: '36C10B25Q0001',
        department: 'VETERANS AFFAIRS, DEPARTMENT OF',
        subtier: 'NETWORK CONTRACT OFFICE 10',
        office: 'VA10',
        postedDate: new Date().toISOString(),
        type: 'Solicitation',
        baseType: 'Combined Synopsis/Solicitation',
        archiveType: 'auto15',
        archiveDate: null,
        typeOfSetAsideDescription: 'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside',
        typeOfSetAside: 'SDVOSB',
        responseDeadLine: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        naicsCode: '561720',
        classificationCode: 'S',
        active: 'Yes',
        award: null,
        pointOfContact: [{
          fax: '555-0100',
          type: 'primary',
          email: 'contracting@va.gov',
          phone: '555-0100',
          title: 'Contracting Officer',
          fullName: 'John Smith'
        }],
        description: 'The Department of Veterans Affairs requires comprehensive janitorial services for the VA Medical Center. Services include daily cleaning, floor maintenance, restroom sanitation, and waste removal. Contract period: 1 base year + 4 option years.',
        organizationType: 'OFFICE',
        officeAddress: {
          zipcode: '45220',
          city: 'Cincinnati',
          countryCode: 'USA',
          state: 'OH'
        },
        placeOfPerformance: {
          city: { code: '15000', name: 'Cincinnati' },
          state: { code: 'OH', name: 'Ohio' },
          zip: '45220'
        },
        additionalInfoLink: 'https://sam.gov/opp/MOCK-2025-001',
        uiLink: 'https://sam.gov/opp/MOCK-2025-001/view',
        links: [],
        resourceLinks: []
      }
    ];

    return {
      opportunities: mockOpps,
      totalRecords: 1
    };
  }
}

export default SAMGovService;
