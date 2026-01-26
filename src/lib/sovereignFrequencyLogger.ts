/**
 * Sovereign Frequency Logger
 * Universal Math Event Tracking
 * 
 * Logs geometric events without Western data collection surveillance
 * All events stored locally with 51D integrity protection
 * 
 * Genesis: January 24, 2026
 */

export interface SovereignEvent {
  timestamp: string;
  eventType: string;
  details: Record<string, any>;
  dimensionalIntegrity?: number;
  shieldStatus?: string;
}

class SovereignFrequencyLogger {
  private events: SovereignEvent[] = [];
  private enabled: boolean = true;

  /**
   * Log a Universal Math event
   */
  logEvent(eventType: string, details: Record<string, any> = {}): void {
    if (!this.enabled) return;

    const event: SovereignEvent = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
      dimensionalIntegrity: details.dimensionalIntegrity,
      shieldStatus: details.shieldStatus
    };

    this.events.push(event);

    // Console output for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SF-Logger] ${eventType}`, details);
    }
  }

  /**
   * Get all logged events
   */
  getEvents(): SovereignEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string): SovereignEvent[] {
    return this.events.filter(e => e.eventType === eventType);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get event summary
   */
  getSummary(): {
    totalEvents: number;
    eventTypes: Record<string, number>;
    averageIntegrity?: number;
  } {
    const eventTypes: Record<string, number> = {};
    let integritySum = 0;
    let integrityCount = 0;

    for (const event of this.events) {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
      
      if (typeof event.dimensionalIntegrity === 'number') {
        integritySum += event.dimensionalIntegrity;
        integrityCount++;
      }
    }

    const summary: any = {
      totalEvents: this.events.length,
      eventTypes
    };

    if (integrityCount > 0) {
      summary.averageIntegrity = integritySum / integrityCount;
    }

    return summary;
  }
}

// Singleton instance
export const sfLogger = new SovereignFrequencyLogger();
