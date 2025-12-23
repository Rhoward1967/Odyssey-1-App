/**
 * NDA (Non-Disclosure Agreement) Generator
 * Protects Odyssey 2.0 invention when showing to investors, manufacturers, partners
 * Saves $500-$1,000 in attorney drafting fees
 */

import { supabase } from '@/lib/supabaseClient';

interface NDAParty {
  name: string;
  role: 'disclosing' | 'receiving' | 'mutual';
  address: string;
  email?: string;
  company?: string;
}

interface NDATerms {
  type: 'mutual' | 'one-way';
  term_years: number;
  confidential_info_scope: string;
  purpose: string;
  permitted_disclosures: string[];
  return_materials: boolean;
  non_compete: boolean;
  non_compete_months?: number;
  governing_law: string; // e.g., "State of Georgia"
  jurisdiction: string; // e.g., "Athens, Georgia"
}

interface NDA {
  id: string;
  parties: NDAParty[];
  terms: NDATerms;
  effective_date: string;
  expiration_date: string;
  document_text: string;
  signed: boolean;
  created_at: string;
}

export class NDAGenerator {

  /**
   * Generate NDA for Odyssey 2.0 disclosure to manufacturer
   */
  async generateManufacturerNDA(
    disclosingParty: NDAParty,
    receivingParty: NDAParty,
    customTerms?: Partial<NDATerms>
  ): Promise<NDA> {
    const terms: NDATerms = {
      type: 'one-way',
      term_years: 3,
      confidential_info_scope: 'All technical specifications, designs, source code, patent applications, business plans, and related materials for the Odyssey 2.0 Modular Wireless Computing System with Continuous Neural Authentication, including but not limited to: Locus Ring wearable device, Lumen Core modular computer, Neural Gesture Engine, R.O.M.A.N. AI system, and all associated intellectual property.',
      purpose: 'Evaluating potential manufacturing partnership and production feasibility',
      permitted_disclosures: [
        'To employees who have a legitimate need to know',
        'To legal counsel for purposes of providing legal advice',
        'As required by law or court order (with prior written notice to Disclosing Party)'
      ],
      return_materials: true,
      non_compete: false,
      governing_law: 'State of Georgia',
      jurisdiction: 'Athens, Georgia',
      ...customTerms
    };

    return this.generateNDA([disclosingParty, receivingParty], terms);
  }

  /**
   * Generate NDA for Odyssey 2.0 disclosure to investor
   */
  async generateInvestorNDA(
    disclosingParty: NDAParty,
    receivingParty: NDAParty,
    customTerms?: Partial<NDATerms>
  ): Promise<NDA> {
    const terms: NDATerms = {
      type: 'one-way',
      term_years: 5,
      confidential_info_scope: 'All business plans, financial projections, technical specifications, patent applications, market analysis, competitive intelligence, and proprietary information related to Odyssey 2.0 and R.O.M.A.N. AI technology.',
      purpose: 'Evaluating potential investment opportunity',
      permitted_disclosures: [
        'To investment committee members who have signed confidentiality agreements',
        'To legal and financial advisors for due diligence purposes',
        'As required by SEC regulations or law enforcement (with prior notice)'
      ],
      return_materials: true,
      non_compete: true,
      non_compete_months: 24,
      governing_law: 'State of Georgia',
      jurisdiction: 'Athens, Georgia',
      ...customTerms
    };

    return this.generateNDA([disclosingParty, receivingParty], terms);
  }

  /**
   * Generate mutual NDA for partnership discussions
   */
  async generatePartnershipNDA(
    party1: NDAParty,
    party2: NDAParty,
    customTerms?: Partial<NDATerms>
  ): Promise<NDA> {
    party1.role = 'mutual';
    party2.role = 'mutual';

    const terms: NDATerms = {
      type: 'mutual',
      term_years: 3,
      confidential_info_scope: 'All proprietary technical, business, and financial information exchanged between the parties related to Odyssey 2.0 technology, R.O.M.A.N. AI system, and potential strategic partnership opportunities.',
      purpose: 'Exploring potential strategic partnership, technology integration, or joint venture',
      permitted_disclosures: [
        'To employees with a need to know who have signed confidentiality agreements',
        'To legal, financial, and technical advisors',
        'To the extent required by applicable law or regulation (with prior notice)'
      ],
      return_materials: true,
      non_compete: false,
      governing_law: 'State of Georgia',
      jurisdiction: 'Athens, Georgia',
      ...customTerms
    };

    return this.generateNDA([party1, party2], terms);
  }

  /**
   * Core NDA generation logic
   */
  private async generateNDA(parties: NDAParty[], terms: NDATerms): Promise<NDA> {
    const effectiveDate = new Date();
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + terms.term_years);

    const documentText = this.generateNDADocument(parties, terms, effectiveDate, expirationDate);

    const nda: NDA = {
      id: crypto.randomUUID(),
      parties,
      terms,
      effective_date: effectiveDate.toISOString(),
      expiration_date: expirationDate.toISOString(),
      document_text: documentText,
      signed: false,
      created_at: new Date().toISOString()
    };

    await this.saveNDA(nda);

    return nda;
  }

  /**
   * Generate formal NDA document text
   */
  private generateNDADocument(
    parties: NDAParty[],
    terms: NDATerms,
    effectiveDate: Date,
    expirationDate: Date
  ): string {
    const isMutual = terms.type === 'mutual';
    const disclosing = parties.find(p => p.role === 'disclosing' || p.role === 'mutual');
    const receiving = parties.find(p => p.role === 'receiving' || p.role === 'mutual');

    if (!disclosing || !receiving) {
      throw new Error('Invalid parties: must have disclosing and receiving parties');
    }

    return `
NON-DISCLOSURE AGREEMENT
${isMutual ? '(MUTUAL)' : '(ONE-WAY)'}

This Non-Disclosure Agreement ("Agreement") is entered into as of ${this.formatDate(effectiveDate)} ("Effective Date"), by and between:

${this.formatParty(disclosing, isMutual ? 'Party A' : 'Disclosing Party')}

AND

${this.formatParty(receiving, isMutual ? 'Party B' : 'Receiving Party')}

(Each, a "Party" and collectively, the "Parties")

RECITALS

WHEREAS, ${isMutual ? 'the Parties wish to explore a business relationship' : `${disclosing.name} possesses certain confidential and proprietary information`} related to ${terms.purpose};

WHEREAS, ${isMutual ? 'each Party may disclose to the other Party certain Confidential Information' : `${receiving.name} desires to receive such information for the purpose of ${terms.purpose}`};

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION

1.1 "Confidential Information" means any and all information disclosed by ${isMutual ? 'one Party (the "Disclosing Party") to the other Party (the "Receiving Party")' : 'Disclosing Party to Receiving Party'}, whether disclosed orally, in writing, electronically, or by any other means, including but not limited to:

${terms.confidential_info_scope}

1.2 Confidential Information shall also include:
   (a) All notes, analyses, compilations, studies, or other documents prepared by Receiving Party that contain or reflect Confidential Information;
   (b) The existence and terms of this Agreement;
   (c) The fact that discussions or negotiations are taking place between the Parties.

1.3 Confidential Information shall NOT include information that:
   (a) Is or becomes publicly available through no breach of this Agreement by Receiving Party;
   (b) Was rightfully in Receiving Party's possession prior to disclosure by Disclosing Party;
   (c) Is rightfully received by Receiving Party from a third party without breach of any confidentiality obligation;
   (d) Is independently developed by Receiving Party without use of or reference to Confidential Information;
   (e) Is required to be disclosed by law, regulation, or court order (provided Receiving Party gives prior written notice to Disclosing Party).

2. OBLIGATIONS OF RECEIVING PARTY

2.1 Receiving Party agrees to:
   (a) Hold and maintain all Confidential Information in strict confidence;
   (b) Not disclose Confidential Information to any third party except as permitted in Section 2.2;
   (c) Not use Confidential Information for any purpose other than ${terms.purpose};
   (d) Protect Confidential Information with the same degree of care used to protect its own confidential information, but in no event less than reasonable care;
   (e) Not reverse engineer, disassemble, or decompile any prototypes, software, or other tangible objects that embody Confidential Information.

2.2 Permitted Disclosures:
Receiving Party may disclose Confidential Information only to the following:
${terms.permitted_disclosures.map((d, i) => `   ${String.fromCharCode(97 + i)}) ${d}`).join('\n')}

All such recipients must be informed of the confidential nature of the information and must agree in writing to be bound by confidentiality obligations at least as restrictive as those contained in this Agreement.

3. INTELLECTUAL PROPERTY

3.1 All Confidential Information remains the sole and exclusive property of Disclosing Party.

3.2 No license or right under any patent, copyright, trademark, trade secret, or other intellectual property right is granted to Receiving Party by disclosure of Confidential Information, except as expressly stated in a separate written agreement signed by Disclosing Party.

3.3 Receiving Party acknowledges that Disclosing Party has filed provisional patent application(s) for the technology disclosed, including but not limited to:
   - U.S. Provisional Patent Application No. 63/913,134
   - Filed November 7, 2025
   - Title: "A DUAL-HEMISPHERE, CONSTITUTIONALLY-GOVERNED AI AND MODULAR COMPUTING SYSTEM"

3.4 Receiving Party agrees not to file any patent application that would claim any invention disclosed in Disclosing Party's Confidential Information.

4. RETURN OR DESTRUCTION OF MATERIALS

${terms.return_materials ? `
4.1 Upon request by Disclosing Party, or upon termination of this Agreement, Receiving Party shall:
   (a) Immediately cease using all Confidential Information;
   (b) Return to Disclosing Party all tangible materials containing Confidential Information, including all copies, notes, and derivatives;
   (c) Permanently delete all electronic copies of Confidential Information from all systems and storage media;
   (d) Certify in writing to Disclosing Party that it has complied with the foregoing.

4.2 Notwithstanding the above, Receiving Party may retain one (1) copy of Confidential Information in its legal files solely for purposes of determining its obligations under this Agreement.
` : `
4.1 Receiving Party may retain Confidential Information in its files but must continue to maintain confidentiality in accordance with this Agreement even after termination.
`}

5. TERM AND TERMINATION

5.1 This Agreement shall commence on the Effective Date and continue for a period of ${terms.term_years} years, expiring on ${this.formatDate(expirationDate)}.

5.2 The obligations of confidentiality under this Agreement shall survive termination and continue for ${terms.term_years} years after the date of disclosure of any Confidential Information.

5.3 Either Party may terminate this Agreement at any time by providing thirty (30) days' written notice to the other Party.

${terms.non_compete ? `
6. NON-COMPETE CLAUSE

6.1 During the term of this Agreement and for a period of ${terms.non_compete_months} months following its termination, Receiving Party agrees not to:
   (a) Develop, manufacture, market, or sell any product or service that directly competes with Odyssey 2.0 technology;
   (b) Assist any third party in developing competing technology based on Confidential Information disclosed under this Agreement;
   (c) Solicit or hire any employee or contractor of Disclosing Party who has been involved with the disclosed technology.

6.2 This non-compete clause applies only to technology substantially similar to or derived from the Confidential Information disclosed hereunder.
` : ''}

${terms.non_compete ? '7' : '6'}. REMEDIES

${terms.non_compete ? '7' : '6'}.1 Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to Disclosing Party for which monetary damages would be inadequate.

${terms.non_compete ? '7' : '6'}.2 In the event of a breach or threatened breach, Disclosing Party shall be entitled to:
   (a) Seek injunctive relief without the necessity of posting a bond;
   (b) Recover all costs and expenses, including reasonable attorneys' fees, incurred in enforcing this Agreement;
   (c) Seek any other remedies available at law or in equity.

${terms.non_compete ? '8' : '7'}. NO WARRANTY

${terms.non_compete ? '8' : '7'}.1 ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

${terms.non_compete ? '8' : '7'}.2 Disclosing Party does not warrant the accuracy, completeness, or suitability of any Confidential Information for any particular purpose.

${terms.non_compete ? '9' : '8'}. MISCELLANEOUS PROVISIONS

${terms.non_compete ? '9' : '8'}.1 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of the ${terms.governing_law}, without regard to its conflicts of law principles.

${terms.non_compete ? '9' : '8'}.2 Jurisdiction: Any action arising out of or relating to this Agreement shall be brought exclusively in the courts located in ${terms.jurisdiction}, and the Parties hereby consent to the personal jurisdiction of such courts.

${terms.non_compete ? '9' : '8'}.3 Entire Agreement: This Agreement constitutes the entire agreement between the Parties concerning the subject matter hereof and supersedes all prior agreements and understandings, whether written or oral.

${terms.non_compete ? '9' : '8'}.4 Amendment: This Agreement may not be amended except by a written instrument signed by both Parties.

${terms.non_compete ? '9' : '8'}.5 Waiver: No waiver of any provision of this Agreement shall be deemed or shall constitute a waiver of any other provision, nor shall any waiver constitute a continuing waiver.

${terms.non_compete ? '9' : '8'}.6 Severability: If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

${terms.non_compete ? '9' : '8'}.7 Counterparts: This Agreement may be executed in counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument.

${terms.non_compete ? '9' : '8'}.8 Notices: All notices required or permitted under this Agreement shall be in writing and delivered to the addresses set forth above, or to such other address as a Party may designate in writing.

IN WITNESS WHEREOF, the Parties have executed this Non-Disclosure Agreement as of the Effective Date.

${this.formatSignatureBlock(disclosing, isMutual ? 'PARTY A' : 'DISCLOSING PARTY')}

${this.formatSignatureBlock(receiving, isMutual ? 'PARTY B' : 'RECEIVING PARTY')}

---

CONFIDENTIAL - ATTORNEY-CLIENT PRIVILEGED
GENERATED BY ODYSSEY-1 NDA GENERATOR
${new Date().toISOString()}
`.trim();
  }

  private formatParty(party: NDAParty, label: string): string {
    return `
${label}:
${party.name}
${party.company ? `Company: ${party.company}\n` : ''}Address: ${party.address}
${party.email ? `Email: ${party.email}` : ''}
`.trim();
  }

  private formatSignatureBlock(party: NDAParty, label: string): string {
    return `
${label}:

Signature: _________________________________

Name: ${party.name}

Title: _________________________________

Date: _________________________________
`.trim();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Save NDA to database
   */
  private async saveNDA(nda: NDA): Promise<void> {
    const { error } = await supabase
      .from('ndas')
      .insert({
        id: nda.id,
        parties: nda.parties,
        terms: nda.terms,
        effective_date: nda.effective_date,
        expiration_date: nda.expiration_date,
        document_text: nda.document_text,
        signed: nda.signed,
        created_at: nda.created_at
      });

    if (error) {
      console.error('Failed to save NDA:', error);
      throw error;
    }
  }

  /**
   * Export NDA to Word document
   */
  async exportToWord(nda: NDA, filename: string): Promise<void> {
    // In production, use docx library to generate formatted Word document
    console.log(`Exporting NDA to ${filename}`);
    // await fs.writeFile(filename, nda.document_text);
  }

  /**
   * Export NDA to PDF
   */
  async exportToPDF(nda: NDA, filename: string): Promise<void> {
    // In production, use pdf-lib or puppeteer to generate PDF
    console.log(`Exporting NDA to ${filename}`);
  }

  /**
   * Mark NDA as signed
   */
  async markAsSigned(ndaId: string, signatureData: any): Promise<void> {
    const { error } = await supabase
      .from('ndas')
      .update({ 
        signed: true, 
        signature_data: signatureData,
        signed_date: new Date().toISOString()
      })
      .eq('id', ndaId);

    if (error) {
      console.error('Failed to mark NDA as signed:', error);
      throw error;
    }
  }
}

// Example usage
export async function generateOdyssey2ManufacturerNDA(manufacturerName: string, manufacturerAddress: string): Promise<NDA> {
  const generator = new NDAGenerator();

  const disclosingParty: NDAParty = {
    name: 'Rickey Allan Howard',
    role: 'disclosing',
    address: '595 Macon Hwy, Apt 35, Athens, GA 30606',
    email: 'rickey@odyssey.ai'
  };

  const receivingParty: NDAParty = {
    name: manufacturerName,
    role: 'receiving',
    address: manufacturerAddress,
    company: manufacturerName
  };

  const nda = await generator.generateManufacturerNDA(disclosingParty, receivingParty);

  console.log('✅ Generated NDA for manufacturer disclosure');
  console.log(`   Protects Odyssey 2.0 IP when showing to ${manufacturerName}`);
  console.log(`   Saves $500-$1,000 in attorney drafting fees!`);

  return nda;
}
