/**
 * Evidence Management Service
 * 
 * Handles file uploads, OCR text extraction, and FDCPA violation detection
 * for legal evidence repository.
 * 
 * Legal Standards:
 * - 15 USC §1692e: False or misleading representations
 * - 15 USC §1692f: Unfair practices
 * - 15 USC §1692g: Validation disclosure requirements
 */

import { supabase } from '@/lib/supabaseClient';

// OCR library - install separately: npm install tesseract.js
// Dynamic import handled at runtime to make it optional
let Tesseract: any = null;

export interface EvidenceFile {
  id: string;
  accountId: string;
  fileName: string;
  fileType: 'usps_receipt' | 'collection_letter' | 'validation_response' | 'court_document' | 'credit_report' | 'other';
  fileUrl: string;
  ocrText?: string;
  detectedViolations: Violation[];
  violationCount: number;
  statutoryDamagesTotal: number;
  documentDate?: Date;
  deliveryDate?: Date;
  responseDeadline?: Date;
  notes?: string;
  tags?: string[];
  createdAt: Date;
}

export interface Violation {
  statute: string;
  description: string;
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  statutoryDamages: number;
  evidence: string; // Exact quote from letter
}

class EvidenceService {
  private readonly BUCKET_NAME = 'legal-evidence';

  /**
   * Upload file to Supabase Storage and create evidence log entry
   */
  async uploadEvidence(
    file: File,
    accountId: string,
    fileType: EvidenceFile['fileType'],
    metadata?: {
      documentDate?: Date;
      deliveryDate?: Date;
      notes?: string;
    }
  ): Promise<EvidenceFile> {
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${accountId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Calculate response deadline if delivery date provided
      let responseDeadline: Date | undefined;
      if (metadata?.deliveryDate) {
        responseDeadline = new Date(metadata.deliveryDate);
        responseDeadline.setDate(responseDeadline.getDate() + 30); // FDCPA 30-day window
      }

      // Create database entry
      const { data: evidenceData, error: dbError } = await supabase
        .from('evidence_log')
        .insert({
          account_id: accountId,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size_bytes: file.size,
          mime_type: file.type,
          document_date: metadata?.documentDate?.toISOString(),
          delivery_date: metadata?.deliveryDate?.toISOString(),
          fcra_deadline: responseDeadline?.toISOString(),
          notes: metadata?.notes
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // OCR processing disabled - use R.O.M.A.N. vision API instead via "Analyze with R.O.M.A.N." button
      // If it's a collection letter, trigger OCR processing
      // if (fileType === 'collection_letter' || fileType === 'validation_response') {
      //   this.processOCR(evidenceData.id, publicUrl);
      // }

      return this.mapToEvidenceFile(evidenceData);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  }

  /**
   * Extract text from image using OCR (Tesseract.js)
   * DISABLED: Use R.O.M.A.N. vision API instead (no npm dependency required)
   */
  async processOCR(evidenceId: string, fileUrl: string): Promise<void> {
    // OCR functionality disabled - tesseract.js requires npm installation
    // Use R.O.M.A.N. "Analyze with R.O.M.A.N." button instead for superior AI vision analysis
    console.warn('OCR disabled: Use R.O.M.A.N. vision API instead');
    return;
    
    /* Original OCR code - commented out until tesseract.js installed
    // Try to load Tesseract dynamically if not already loaded
    if (!Tesseract) {
      try {
        // @ts-ignore - Optional dependency, may not be installed
        Tesseract = await import('tesseract.js');
      } catch (e) {
        console.warn('OCR skipped: tesseract.js not installed');
        await supabase
          .from('evidence_log')
          .update({
            ocr_text: 'OCR not available. Install tesseract.js to enable automatic text extraction.',
            ocr_processed_at: new Date().toISOString()
          })
          .eq('id', evidenceId);
        return;
      }
    }

    try {
      const { data: { text }, data: { confidence } } = await Tesseract.recognize(
        fileUrl,
        'eng',
        {
          logger: (m) => console.log('OCR Progress:', m)
        }
      );

      // Detect violations in extracted text
      const violations = this.detectViolations(text);
      const totalDamages = violations.reduce((sum, v) => sum + v.statutoryDamages, 0);

      // Update database with OCR results
      await supabase
        .from('evidence_log')
        .update({
          ocr_text: text,
          ocr_confidence: confidence,
          ocr_processed_at: new Date().toISOString(),
          detected_violations: violations,
          violation_count: violations.length,
          statutory_damages_total: totalDamages,
          tags: this.extractTags(violations)
        })
        .eq('id', evidenceId);

    } catch (error) {
      console.error('OCR processing error:', error);
      // Don't throw - OCR failure shouldn't block evidence upload
    }
    */
  }

  /**
   * Detect FDCPA violations in letter text
   */
  private detectViolations(text: string): Violation[] {
    const violations: Violation[] = [];
    const lowerText = text.toLowerCase();

    // 15 USC §1692e(5): Threat to take action that cannot legally be taken
    const threatPatterns = [
      /we will sue you/i,
      /legal action will be taken/i,
      /garnish.*wage/i,
      /arrest warrant/i,
      /criminal charges/i,
      /seize.*property/i,
      /lawsuit.*filed/i
    ];

    for (const pattern of threatPatterns) {
      const match = text.match(pattern);
      if (match) {
        violations.push({
          statute: '15 USC §1692e(5)',
          description: 'Threat of action that cannot legally be taken or is not intended to be taken',
          severity: 'CRITICAL',
          statutoryDamages: 1000,
          evidence: match[0]
        });
      }
    }

    // 15 USC §1692e(2)(A): False representation of amount owed
    if (/you owe \$[\d,]+/i.test(text) && !/itemized statement/i.test(text)) {
      violations.push({
        statute: '15 USC §1692e(2)(A)',
        description: 'False representation of character, amount, or legal status of debt',
        severity: 'MODERATE',
        statutoryDamages: 1000,
        evidence: 'Amount claimed without itemized breakdown'
      });
    }

    // 15 USC §1692g: Missing validation notice (Mini-Miranda)
    const hasMiniMiranda = /this is an attempt to collect a debt/i.test(lowerText) &&
                          /any information obtained will be used/i.test(lowerText);
    
    if (!hasMiniMiranda) {
      violations.push({
        statute: '15 USC §1692g(a)',
        description: 'Failed to provide required validation notice within 5 days of initial communication',
        severity: 'CRITICAL',
        statutoryDamages: 1000,
        evidence: 'Missing Mini-Miranda disclosure'
      });
    }

    // 15 USC §1692e(10): False credit reporting threat
    if (/credit report/i.test(text) && /damage.*credit/i.test(lowerText)) {
      violations.push({
        statute: '15 USC §1692e(10)',
        description: 'Use of false representation or deceptive means to collect debt',
        severity: 'MODERATE',
        statutoryDamages: 1000,
        evidence: 'Misleading credit reporting threat'
      });
    }

    // 15 USC §1692d: Harassment or abuse
    const harassmentPatterns = [
      /call you repeatedly/i,
      /call.*all hours/i,
      /contact.*employer/i,
      /tell.*family/i,
      /public embarrassment/i
    ];

    for (const pattern of harassmentPatterns) {
      const match = text.match(pattern);
      if (match) {
        violations.push({
          statute: '15 USC §1692d',
          description: 'Harassment or abuse in connection with collection of debt',
          severity: 'CRITICAL',
          statutoryDamages: 1000,
          evidence: match[0]
        });
      }
    }

    // 15 USC §1692f: Unfair practices (unauthorized fees)
    if (/collection fee/i.test(text) || /administrative charge/i.test(text)) {
      violations.push({
        statute: '15 USC §1692f',
        description: 'Unfair or unconscionable means to collect debt (unauthorized fees)',
        severity: 'MODERATE',
        statutoryDamages: 1000,
        evidence: 'Collection fees not authorized by original agreement'
      });
    }

    return violations;
  }

  /**
   * Extract tags from violations for filtering
   */
  private extractTags(violations: Violation[]): string[] {
    const tags = new Set<string>();
    
    violations.forEach(v => {
      if (v.statute.includes('1692e')) tags.add('false_representation');
      if (v.statute.includes('1692d')) tags.add('harassment');
      if (v.statute.includes('1692f')) tags.add('unfair_practice');
      if (v.statute.includes('1692g')) tags.add('missing_disclosure');
      if (v.evidence.toLowerCase().includes('sue')) tags.add('threat');
    });

    return Array.from(tags);
  }

  /**
   * Get all evidence for an account
   */
  async getAccountEvidence(accountId: string): Promise<EvidenceFile[]> {
    const { data, error } = await supabase
      .from('evidence_log')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(this.mapToEvidenceFile) || [];
  }

  /**
   * Update evidence notes/tags
   */
  async updateEvidence(
    evidenceId: string,
    updates: {
      notes?: string;
      tags?: string[];
      documentDate?: Date;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('evidence_log')
      .update({
        notes: updates.notes,
        tags: updates.tags,
        document_date: updates.documentDate?.toISOString()
      })
      .eq('id', evidenceId);

    if (error) throw error;
  }

  /**
   * Delete evidence file
   */
  async deleteEvidence(evidenceId: string): Promise<void> {
    // Get file URL first
    const { data } = await supabase
      .from('evidence_log')
      .select('file_url')
      .eq('id', evidenceId)
      .single();

    if (data) {
      // Extract file path from URL
      const filePath = data.file_url.split(`${this.BUCKET_NAME}/`)[1];
      
      // Delete from storage
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
    }

    // Delete from database
    await supabase
      .from('evidence_log')
      .delete()
      .eq('id', evidenceId);
  }

  /**
   * Map database row to EvidenceFile interface
   */
  private mapToEvidenceFile(row: any): EvidenceFile {
    return {
      id: row.id,
      accountId: row.account_id,
      fileName: row.file_name,
      fileType: row.file_type,
      fileUrl: row.file_url,
      ocrText: row.ocr_text,
      detectedViolations: row.detected_violations || [],
      violationCount: row.violation_count || 0,
      statutoryDamagesTotal: parseFloat(row.statutory_damages_total || 0),
      documentDate: row.document_date ? new Date(row.document_date) : undefined,
      deliveryDate: row.delivery_date ? new Date(row.delivery_date) : undefined,
      responseDeadline: row.fcra_deadline ? new Date(row.fcra_deadline) : undefined,
      notes: row.notes,
      tags: row.tags || [],
      createdAt: new Date(row.created_at)
    };
  }
}

export const evidenceService = new EvidenceService();
