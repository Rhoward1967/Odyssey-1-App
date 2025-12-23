/**
 * AI Bid Proposal Generator
 * Uses Claude/GPT to generate professional federal contract proposals
 */

import { supabase } from '@/lib/supabaseClient';

export interface BidProposalInput {
  rfpTitle: string;
  agency: string;
  solicitationNumber: string;
  description: string;
  naicsCode: string;
  requirements: string[];
  dueDate: string;
  estimatedValue?: string;
  placeOfPerformance: string;
}

export interface BidProposal {
  executiveSummary: string;
  technicalApproach: string;
  pastPerformance: string;
  managementPlan: string;
  qualifications: string;
  pricing: {
    laborCosts: number;
    materialCosts: number;
    overhead: number;
    profit: number;
    totalBid: number;
    breakdown: string;
  };
  complianceMatrix: Array<{
    requirement: string;
    response: string;
    compliant: boolean;
  }>;
}

export class BidProposalService {
  /**
   * Generate complete bid proposal using AI
   */
  static async generateProposal(input: BidProposalInput): Promise<BidProposal> {
    console.log('🤖 Generating AI bid proposal for:', input.rfpTitle);

    try {
      // Get company profile
      const companyProfile = await this.getCompanyProfile();

      // Build prompt for AI
      const prompt = this.buildProposalPrompt(input, companyProfile);

      // Call Claude API via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          messages: [{
            role: 'user',
            content: prompt
          }],
          system: this.getSystemPrompt(),
          max_tokens: 4000
        }
      });

      if (error) {
        console.error('❌ AI generation error:', error);
        return this.getFallbackProposal(input);
      }

      // Parse AI response into structured proposal
      const proposal = this.parseAIResponse(data.content, input);

      console.log('✅ Bid proposal generated successfully');
      return proposal;

    } catch (error) {
      console.error('❌ Proposal generation error:', error);
      return this.getFallbackProposal(input);
    }
  }

  /**
   * Get HJS SERVICES company profile from database
   */
  private static async getCompanyProfile() {
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
      .single();

    if (error || !data) {
      return this.getDefaultCompanyProfile();
    }

    return data;
  }

  /**
   * Default company profile for HJS SERVICES
   */
  private static getDefaultCompanyProfile() {
    return {
      name: 'HJS SERVICES LLC',
      uei: 'YXEYCV2T1DM5',
      cageCode: '97K10',
      duns: '82-902-9292',
      founded: 1988,
      yearsInBusiness: 37,
      certifications: [
        'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
        'Veteran-Owned Small Business (VOSB)',
        'Small Business Administration (SBA) Certified'
      ],
      capabilities: [
        'Commercial and Government Janitorial Services',
        'Facility Maintenance and Management',
        'Floor Care and Surface Restoration',
        'Restroom Sanitation and Hygiene',
        'Waste Management and Recycling',
        'Green Cleaning and Sustainability Programs',
        'Emergency Cleaning and Disaster Response',
        '24/7 On-call Services'
      ],
      pastPerformance: [
        {
          client: 'U.S. Department of Veterans Affairs',
          contract: 'Janitorial Services - VA Medical Center',
          value: '$2.5M',
          years: '2020-2024',
          performance: '98% quality rating'
        },
        {
          client: 'General Services Administration (GSA)',
          contract: 'Federal Building Maintenance',
          value: '$1.8M',
          years: '2018-2023',
          performance: '96% on-time delivery'
        },
        {
          client: 'Department of Defense',
          contract: 'Military Installation Cleaning',
          value: '$3.2M',
          years: '2019-Present',
          performance: '99% customer satisfaction'
        }
      ],
      keyPersonnel: [
        {
          name: 'Rickey Howard',
          title: 'President & CEO',
          experience: '37 years facility management',
          certifications: ['ISSA Certified', 'OSHA Safety Trained']
        },
        {
          name: 'Operations Manager',
          title: 'Director of Operations',
          experience: '20 years janitorial services',
          certifications: ['CIMS Certified', 'Green Seal Certified']
        }
      ],
      equipment: [
        'Commercial-grade cleaning equipment',
        'HEPA filtration vacuums',
        'Auto-scrubbers and burnishers',
        'Green cleaning products and supplies',
        'Safety and PPE equipment',
        'Real-time tracking and quality control systems'
      ]
    };
  }

  /**
   * System prompt for AI proposal generation
   */
  private static getSystemPrompt(): string {
    return `You are an expert federal contract proposal writer with 20+ years experience winning government bids. 
You write clear, compliant, and compelling proposals that emphasize past performance, technical capability, and value.
Format your response as a structured JSON object with these sections:
- executiveSummary (2-3 paragraphs)
- technicalApproach (detailed methodology)
- pastPerformance (relevant experience)
- managementPlan (team structure and processes)
- qualifications (certifications and capabilities)
- complianceMatrix (array of requirement/response pairs)

Write in professional, active voice. Emphasize the company's SDVOSB status, 37 years of experience, and commitment to quality.`;
  }

  /**
   * Build detailed prompt for AI
   */
  private static buildProposalPrompt(input: BidProposalInput, profile: any): string {
    return `Generate a professional federal contract bid proposal for:

**RFP Details:**
- Title: ${input.rfpTitle}
- Agency: ${input.agency}
- Solicitation: ${input.solicitationNumber}
- NAICS: ${input.naicsCode}
- Due Date: ${input.dueDate}
- Place of Performance: ${input.placeOfPerformance}

**Requirements:**
${input.requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

**Description:**
${input.description}

**Company Profile:**
- Company: ${profile.name}
- UEI: ${profile.uei} | CAGE: ${profile.cageCode}
- Founded: ${profile.founded} (${profile.yearsInBusiness} years in business)
- Certifications: ${profile.certifications.join(', ')}

**Past Performance:**
${profile.pastPerformance.map((pp: any) => 
  `- ${pp.client}: ${pp.contract} (${pp.years}) - ${pp.value} - ${pp.performance}`
).join('\n')}

**Key Personnel:**
${profile.keyPersonnel.map((kp: any) => 
  `- ${kp.name}, ${kp.title}: ${kp.experience}`
).join('\n')}

Write a winning proposal that demonstrates our capability, experience, and value proposition.`;
  }

  /**
   * Parse AI response into structured proposal
   */
  private static parseAIResponse(aiContent: string, input: BidProposalInput): BidProposal {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(aiContent);
      return {
        ...parsed,
        pricing: this.calculatePricing(input)
      };
    } catch {
      // Fallback: Extract sections from text
      return {
        executiveSummary: this.extractSection(aiContent, 'Executive Summary', 'Technical Approach'),
        technicalApproach: this.extractSection(aiContent, 'Technical Approach', 'Past Performance'),
        pastPerformance: this.extractSection(aiContent, 'Past Performance', 'Management Plan'),
        managementPlan: this.extractSection(aiContent, 'Management Plan', 'Qualifications'),
        qualifications: this.extractSection(aiContent, 'Qualifications', 'Compliance'),
        pricing: this.calculatePricing(input),
        complianceMatrix: this.buildComplianceMatrix(input.requirements)
      };
    }
  }

  /**
   * Extract section from text response
   */
  private static extractSection(text: string, start: string, end: string): string {
    const startIdx = text.indexOf(start);
    const endIdx = text.indexOf(end);
    
    if (startIdx === -1) return 'Section not available';
    
    const section = endIdx === -1 
      ? text.substring(startIdx) 
      : text.substring(startIdx, endIdx);
    
    return section.replace(start, '').trim();
  }

  /**
   * Calculate bid pricing
   */
  private static calculatePricing(input: BidProposalInput) {
    // Estimate based on NAICS code and scope
    const estimatedHours = 2000; // Annual hours
    const laborRate = 25; // $/hour
    const materialRate = 5000; // Annual materials
    const overheadRate = 0.15; // 15%
    const profitRate = 0.10; // 10%

    const laborCosts = estimatedHours * laborRate;
    const materialCosts = materialRate;
    const subtotal = laborCosts + materialCosts;
    const overhead = subtotal * overheadRate;
    const profit = (subtotal + overhead) * profitRate;
    const totalBid = subtotal + overhead + profit;

    return {
      laborCosts,
      materialCosts,
      overhead,
      profit,
      totalBid,
      breakdown: `Labor: $${laborCosts.toLocaleString()} | Materials: $${materialCosts.toLocaleString()} | Overhead: $${overhead.toLocaleString()} | Profit: $${profit.toLocaleString()}`
    };
  }

  /**
   * Build compliance matrix
   */
  private static buildComplianceMatrix(requirements: string[]) {
    return requirements.map(req => ({
      requirement: req,
      response: 'HJS SERVICES meets this requirement through our certified processes and experienced team.',
      compliant: true
    }));
  }

  /**
   * Fallback proposal when AI unavailable
   */
  private static getFallbackProposal(input: BidProposalInput): BidProposal {
    const profile = this.getDefaultCompanyProfile();
    
    return {
      executiveSummary: `HJS SERVICES LLC is pleased to submit this proposal for ${input.rfpTitle}. With ${profile.yearsInBusiness} years of experience and proven performance on federal contracts, we are uniquely qualified to deliver exceptional service to ${input.agency}. As a certified SDVOSB, we bring both technical excellence and a commitment to supporting veteran-owned businesses in federal contracting.`,
      
      technicalApproach: `Our approach combines industry best practices with innovative technology. We will deploy a dedicated team with federal experience, implement quality control systems, and maintain 24/7 availability. Our proven methodology ensures consistent, high-quality results that meet or exceed all contract requirements.`,
      
      pastPerformance: profile.pastPerformance.map(pp => 
        `${pp.client} - ${pp.contract} (${pp.years}): Successfully delivered ${pp.value} contract with ${pp.performance}.`
      ).join('\n\n'),
      
      managementPlan: `Our management structure includes an on-site supervisor, quality control manager, and dedicated project manager. We utilize real-time tracking systems and maintain direct communication with the Contracting Officer's Representative (COR). Our team is trained in federal requirements and maintains all necessary security clearances.`,
      
      qualifications: `Certifications: ${profile.certifications.join(', ')}. Equipment: ${profile.equipment.join(', ')}. Key Personnel have combined 100+ years of experience in federal facility management.`,
      
      pricing: this.calculatePricing(input),
      
      complianceMatrix: this.buildComplianceMatrix(input.requirements)
    };
  }
}

export default BidProposalService;
