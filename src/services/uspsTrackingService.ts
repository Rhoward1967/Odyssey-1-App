/**
 * USPS Tracking Service
 * 
 * Integrates with USPS Web Tools API to track certified mail
 * Required for FDCPA/FCRA compliance (proof of delivery)
 * 
 * API Docs: https://www.usps.com/business/web-tools-apis/
 */

export interface USPSTrackingInfo {
  trackingNumber: string;
  status: string;
  statusCategory: 'PRE_TRANSIT' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION' | 'RETURNED';
  deliveryDate?: Date;
  deliveredTo?: string;
  signedBy?: string;
  events: Array<{
    date: Date;
    time: string;
    description: string;
    location: string;
  }>;
  certifiedMail: boolean;
  returnReceiptRequested: boolean;
}

export class USPSTrackingService {
  private apiKey: string;
  private baseUrl = 'https://secure.shippingapis.com/ShippingAPI.dll';

  constructor() {
    // Get API key from environment variable
    // Register at: https://registration.shippingapis.com/
    this.apiKey = import.meta.env.VITE_USPS_API_KEY || '';
  }

  /**
   * Track a certified mail tracking number
   */
  async trackPackage(trackingNumber: string): Promise<USPSTrackingInfo> {
    if (!this.apiKey) {
      throw new Error('USPS API key not configured. Set VITE_USPS_API_KEY in .env file.');
    }

    // Format tracking number (remove spaces/dashes)
    const cleanTracking = trackingNumber.replace(/[\s-]/g, '');

    // Build USPS XML request
    const xmlRequest = `
      <TrackFieldRequest USERID="${this.apiKey}">
        <TrackID ID="${cleanTracking}"></TrackID>
      </TrackFieldRequest>
    `.trim();

    // Make request to USPS API
    const response = await fetch(`${this.baseUrl}?API=TrackV2&XML=${encodeURIComponent(xmlRequest)}`);
    const xmlText = await response.text();

    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for errors
    const error = xmlDoc.querySelector('Error');
    if (error) {
      const errorMsg = error.querySelector('Description')?.textContent || 'Unknown error';
      throw new Error(`USPS API Error: ${errorMsg}`);
    }

    // Parse tracking info
    const trackInfo = xmlDoc.querySelector('TrackInfo');
    if (!trackInfo) {
      throw new Error('No tracking information found');
    }

    const status = trackInfo.querySelector('Status')?.textContent || 'Unknown';
    const statusSummary = trackInfo.querySelector('StatusSummary')?.textContent || '';
    
    // Parse events
    const events: Array<{
      date: Date;
      time: string;
      description: string;
      location: string;
    }> = [];

    trackInfo.querySelectorAll('TrackDetail').forEach(detail => {
      const eventDate = detail.querySelector('EventDate')?.textContent || '';
      const eventTime = detail.querySelector('EventTime')?.textContent || '';
      const description = detail.textContent || '';
      const location = detail.querySelector('EventCity')?.textContent || '';

      if (eventDate) {
        events.push({
          date: new Date(eventDate),
          time: eventTime,
          description,
          location
        });
      }
    });

    // Determine status category
    let statusCategory: USPSTrackingInfo['statusCategory'] = 'IN_TRANSIT';
    if (status.toLowerCase().includes('delivered')) {
      statusCategory = 'DELIVERED';
    } else if (status.toLowerCase().includes('return')) {
      statusCategory = 'RETURNED';
    } else if (status.toLowerCase().includes('exception') || status.toLowerCase().includes('problem')) {
      statusCategory = 'EXCEPTION';
    } else if (status.toLowerCase().includes('pre') || status.toLowerCase().includes('acceptance')) {
      statusCategory = 'PRE_TRANSIT';
    }

    // Extract delivery details
    let deliveryDate: Date | undefined;
    let deliveredTo: string | undefined;
    let signedBy: string | undefined;

    if (statusCategory === 'DELIVERED') {
      const deliveryEvent = events.find(e => e.description.toLowerCase().includes('delivered'));
      if (deliveryEvent) {
        deliveryDate = deliveryEvent.date;
        // USPS doesn't always provide "delivered to" in API - may need to check events
        deliveredTo = statusSummary;
      }
    }

    // Check if certified mail with return receipt
    const isCertified = statusSummary.toLowerCase().includes('certified') || 
                        cleanTracking.startsWith('9407');
    const hasReturnReceipt = statusSummary.toLowerCase().includes('return receipt') ||
                             statusSummary.toLowerCase().includes('signature');

    return {
      trackingNumber: cleanTracking,
      status: statusSummary,
      statusCategory,
      deliveryDate,
      deliveredTo,
      signedBy,
      events,
      certifiedMail: isCertified,
      returnReceiptRequested: hasReturnReceipt
    };
  }

  /**
   * Check if tracking number is valid certified mail format
   */
  isCertifiedMailTracking(trackingNumber: string): boolean {
    const clean = trackingNumber.replace(/[\s-]/g, '');
    
    // USPS Certified Mail tracking numbers start with:
    // 9407 (Certified Mail)
    // 9208 (Certified Mail with Return Receipt)
    return clean.startsWith('9407') || clean.startsWith('9208');
  }

  /**
   * Calculate FDCPA deadline from delivery date
   * Collection agency has 30 days to respond after receiving validation letter
   */
  calculateResponseDeadline(deliveryDate: Date): Date {
    const deadline = new Date(deliveryDate);
    deadline.setDate(deadline.getDate() + 30);
    return deadline;
  }

  /**
   * Generate USPS tracking URL for manual checking
   */
  getTrackingUrl(trackingNumber: string): string {
    const clean = trackingNumber.replace(/[\s-]/g, '');
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${clean}`;
  }

  /**
   * Bulk track multiple packages (for multiple accounts)
   */
  async trackMultiple(trackingNumbers: string[]): Promise<Map<string, USPSTrackingInfo>> {
    const results = new Map<string, USPSTrackingInfo>();

    // USPS API allows up to 35 tracking numbers per request
    const chunks = this.chunkArray(trackingNumbers, 35);

    for (const chunk of chunks) {
      const promises = chunk.map(num => this.trackPackage(num));
      const trackingInfos = await Promise.allSettled(promises);

      trackingInfos.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(chunk[index], result.value);
        }
      });
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Export singleton instance
export const uspsTrackingService = new USPSTrackingService();

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Register for FREE USPS API key:
 *    https://registration.shippingapis.com/
 * 
 * 2. Add to .env file:
 *    VITE_USPS_API_KEY=your_key_here
 * 
 * 3. Track certified mail:
 *    const tracking = await uspsTrackingService.trackPackage('9407123456789012345678');
 * 
 * 4. Check delivery:
 *    if (tracking.statusCategory === 'DELIVERED') {
 *      const deadline = uspsTrackingService.calculateResponseDeadline(tracking.deliveryDate);
 *      console.log(`Collection agency must respond by ${deadline}`);
 *    }
 * 
 * LEGAL IMPORTANCE:
 * - Certified mail = proof of delivery (required for FDCPA)
 * - Return receipt = signature proof
 * - Delivery date = starts 30-day response clock
 * - Without tracking, you have NO legal evidence letter was received
 */
