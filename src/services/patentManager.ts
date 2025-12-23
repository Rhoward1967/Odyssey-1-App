/**
 * ============================================================================
 * PATENT MANAGEMENT SYSTEM
 * ============================================================================
 * Tracks IP portfolio, deadlines, prior art, and patent filings
 * ============================================================================
 */

import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

interface Patent {
  id?: string;
  patent_type: 'provisional' | 'utility' | 'design' | 'pct' | 'trademark';
  title: string;
  description: string;
  inventors: string[];
  filing_date?: string;
  priority_date?: string;
  deadline_date?: string;
  status: 'conception' | 'provisional_filed' | 'utility_pending' | 'granted' | 'expired';
  patent_number?: string;
  claims: any[];
  prior_art: any[];
  estimated_value_usd?: number;
}

interface Claim {
  claim_number: number;
  claim_type: 'independent' | 'dependent';
  parent_claim?: number;
  claim_text: string;
}

interface PriorArt {
  id?: string;
  patent_id: string;
  source: string;
  title: string;
  date: string;
  relevance_score: number;
  differentiation: string;
}

// ============================================================================
// PATENT PORTFOLIO MANAGER
// ============================================================================

export class PatentPortfolioManager {
  /**
   * Track Odyssey 2.0 provisional patent
   */
  async registerProvisionalPatent(): Promise<void> {
    const provisionalData = {
      patent_type: 'provisional',
      title: 'Odyssey 2.0 - Wireless Desktop Architecture with Neural Biometric Interface',
      description: 'A modular wireless desktop computer system featuring continuous neural authentication via wearable ring device, holographic projection interface, and autonomous power generation.',
      inventors: ['Richard Howard'],
      filing_date: '2025-11-21',
      priority_date: '2025-11-21',
      deadline_date: '2026-11-21', // 12 months to file utility
      status: 'provisional_filed',
      estimated_value_usd: 1700000000 // $1.7B conservative estimate
    };

    const { data, error } = await supabase
      .from('patents')
      .insert(provisionalData)
      .select()
      .single();

    if (error) {
      console.error('Failed to register provisional patent:', error);
      return;
    }

    console.log('✅ Provisional patent registered:', data.id);

    // Now register the 3 main inventions
    await this.registerLocusRingPatent(data.id);
    await this.registerLumenCorePatent(data.id);
    await this.registerNeuralGesturePatent(data.id);
  }

  /**
   * Register Locus Ring invention
   */
  private async registerLocusRingPatent(parentId: string): Promise<void> {
    const locusRing = {
      patent_type: 'utility',
      title: 'Locus Ring - Continuous Neural Authentication and Gesture Control Device',
      description: 'A wearable ring device that continuously authenticates users via neural signature detection and translates sub-muscular nerve impulses into gesture commands without requiring visible hand movement.',
      inventors: ['Richard Howard'],
      priority_date: '2025-11-21',
      deadline_date: '2026-11-21',
      status: 'conception',
      parent_patent_id: parentId,
      estimated_value_usd: 1000000000, // $1B
      key_features: {
        'continuous_auth': 'Passive authentication while worn',
        'neural_sensors': 'Detects nerve impulses in finger',
        'gesture_control': 'Air Tap and Swipe without movement',
        'quantum_handshake': 'One-time cryptographic pairing',
        'instant_lockdown': 'Locks system when removed'
      },
      claims: this.getLocusRingClaims()
    };

    await supabase.from('patents').insert(locusRing);
    console.log('✅ Locus Ring patent registered');
  }

  /**
   * Register Lumen Core invention
   */
  private async registerLumenCorePatent(parentId: string): Promise<void> {
    const lumenCore = {
      patent_type: 'utility',
      title: 'Lumen Core - Modular Wireless Desktop Computing System',
      description: 'A 27-component modular cubic computer architecture featuring wireless power distribution, holographic projection interface, and autonomous solar/thermal power generation.',
      inventors: ['Richard Howard'],
      priority_date: '2025-11-21',
      deadline_date: '2026-11-21',
      status: 'conception',
      parent_patent_id: parentId,
      estimated_value_usd: 500000000, // $500M
      key_features: {
        'modular_architecture': '3x3x3 cubic grid expansion',
        'wireless_power': 'No cables required',
        'holographic_interface': 'Projected screen and keyboard',
        'autonomous_power': 'Solar/thermal regenerative loop',
        'biometric_docking': 'Locus Ring integration'
      },
      claims: this.getLumenCoreClaims()
    };

    await supabase.from('patents').insert(lumenCore);
    console.log('✅ Lumen Core patent registered');
  }

  /**
   * Register Neural Gesture Engine invention
   */
  private async registerNeuralGesturePatent(parentId: string): Promise<void> {
    const neuralGesture = {
      patent_type: 'utility',
      title: 'Neural Gesture Engine - Sub-Muscular Command Interface',
      description: 'A method and system for detecting user intent via nerve impulses prior to physical movement, enabling gesture control without visible hand motion.',
      inventors: ['Richard Howard'],
      priority_date: '2025-11-21',
      deadline_date: '2026-11-21',
      status: 'conception',
      parent_patent_id: parentId,
      estimated_value_usd: 2000000000, // $2B
      key_features: {
        'pre_movement_detection': 'Detects intent before muscle moves',
        'sub_muscular_sensors': 'Nerve impulse electrodes',
        'zero_latency': '<2ms from impulse to command',
        'ml_calibration': 'Learns user neural patterns',
        'gesture_library': 'Air Tap, Swipe, Hold, etc.'
      },
      claims: this.getNeuralGestureClaims(),
      market_applications: [
        'Consumer electronics (smartphones, AR/VR)',
        'Medical devices (prosthetics, accessibility)',
        'Industrial control (hands-free operation)',
        'Military (covert communication)'
      ]
    };

    await supabase.from('patents').insert(neuralGesture);
    console.log('✅ Neural Gesture Engine patent registered');
  }

  /**
   * Generate patent claims for Locus Ring
   */
  private getLocusRingClaims(): Claim[] {
    return [
      {
        claim_number: 1,
        claim_type: 'independent',
        claim_text: 'A wearable biometric authentication device comprising: a ring-shaped housing adapted to be worn on a user\'s finger; neural sensors positioned to detect sub-muscular nerve impulses in said finger; a processor configured to: extract a unique neural signature from detected impulses, continuously authenticate the user based on said neural signature, translate nerve impulses into gesture commands without requiring visible hand movement; a wireless transmitter to communicate authentication status to a paired computing device; wherein removal of the ring triggers immediate lockdown of the paired device.'
      },
      {
        claim_number: 2,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The device of claim 1, wherein the neural sensors detect nerve impulses prior to muscle contraction.'
      },
      {
        claim_number: 3,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The device of claim 1, wherein gesture commands include "Air Tap" and "Swipe" motions.'
      },
      {
        claim_number: 4,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The device of claim 1, wherein pairing occurs via quantum cryptographic handshake.'
      },
      {
        claim_number: 5,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The device of claim 1, wherein the housing is constructed of titanium alloy.'
      }
    ];
  }

  /**
   * Generate patent claims for Lumen Core
   */
  private getLumenCoreClaims(): Claim[] {
    return [
      {
        claim_number: 1,
        claim_type: 'independent',
        claim_text: 'A modular computing system comprising: a plurality of cubic components arranged in a 3-dimensional grid; a central processing unit located at grid center; wireless power distribution connecting all components without cables; a holographic projector integrated into a top component; a biometric authentication interface adapted to pair with a wearable ring device; wherein the system operates autonomously without external power connection.'
      },
      {
        claim_number: 2,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The system of claim 1, wherein components are arranged in a 3x3x3 cubic grid.'
      },
      {
        claim_number: 3,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The system of claim 1, wherein corner components contain solar cells.'
      }
    ];
  }

  /**
   * Generate patent claims for Neural Gesture Engine
   */
  private getNeuralGestureClaims(): Claim[] {
    return [
      {
        claim_number: 1,
        claim_type: 'independent',
        claim_text: 'A method for detecting user intent via neural impulses comprising: positioning electrodes on a user\'s finger to detect nerve signals; detecting sub-muscular electrical impulses prior to muscle contraction; analyzing said impulses to determine intended gestures; translating detected impulses into digital commands; executing commands without requiring visible hand movement.'
      },
      {
        claim_number: 2,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The method of claim 1, wherein gestures are detected before physical motion occurs.'
      },
      {
        claim_number: 3,
        claim_type: 'dependent',
        parent_claim: 1,
        claim_text: 'The method of claim 1, wherein latency from impulse to command is less than 5 milliseconds.'
      }
    ];
  }

  /**
   * Calculate days until utility patent deadline
   */
  async getDeadlineStatus(): Promise<{
    days_remaining: number;
    deadline: string;
    status: 'safe' | 'warning' | 'critical';
  }> {
    const { data: patents } = await supabase
      .from('patents')
      .select('*')
      .eq('patent_type', 'provisional')
      .eq('title', 'Odyssey 2.0 - Wireless Desktop Architecture with Neural Biometric Interface')
      .single();

    if (!patents) {
      return { days_remaining: 365, deadline: '2026-11-21', status: 'safe' };
    }

    const deadline = new Date(patents.deadline_date);
    const now = new Date();
    const daysRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'safe' | 'warning' | 'critical';
    if (daysRemaining > 180) status = 'safe';
    else if (daysRemaining > 60) status = 'warning';
    else status = 'critical';

    return {
      days_remaining: daysRemaining,
      deadline: patents.deadline_date,
      status
    };
  }

  /**
   * Search for prior art
   */
  async searchPriorArt(keywords: string[]): Promise<any[]> {
    // In production, this would search USPTO, Google Patents, etc.
    // For now, return mock results
    const mockPriorArt = [
      {
        source: 'USPTO',
        patent_number: 'US9876543',
        title: 'Wearable Biometric Authentication Device',
        date: '2020-03-15',
        relevance_score: 65,
        differentiation: 'Uses fingerprint sensor, not neural detection. No gesture control.'
      },
      {
        source: 'Google Patents',
        patent_number: 'US1234567',
        title: 'Gesture Recognition System',
        date: '2018-07-22',
        relevance_score: 45,
        differentiation: 'Camera-based gesture detection. Requires visible hand movement.'
      },
      {
        source: 'Academic Paper',
        title: 'EMG-Based Gesture Control',
        date: '2019-11-10',
        relevance_score: 70,
        differentiation: 'Detects muscle movement (EMG), not nerve impulses pre-movement.'
      }
    ];

    return mockPriorArt;
  }

  /**
   * Generate patent portfolio report
   */
  async generatePortfolioReport(): Promise<{
    total_patents: number;
    total_value: number;
    patents_by_status: any;
    deadlines: any[];
  }> {
    const { data: patents } = await supabase
      .from('patents')
      .select('*');

    if (!patents || patents.length === 0) {
      return {
        total_patents: 0,
        total_value: 0,
        patents_by_status: {},
        deadlines: []
      };
    }

    const totalValue = patents.reduce((sum, p) => sum + (p.estimated_value_usd || 0), 0);
    
    const byStatus = patents.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const deadlines = patents
      .filter(p => p.deadline_date)
      .map(p => ({
        title: p.title,
        deadline: p.deadline_date,
        days_remaining: Math.floor((new Date(p.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.days_remaining - b.days_remaining);

    return {
      total_patents: patents.length,
      total_value: totalValue,
      patents_by_status: byStatus,
      deadlines
    };
  }
}

// Export singleton
export const patentManager = new PatentPortfolioManager();
