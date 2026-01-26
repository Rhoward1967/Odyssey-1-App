/**
 * ============================================================================
 * R.O.M.A.N. 2.0 UNIVERSAL MATH LOGIC GATE
 * ============================================================================
 * 
 * © 2026 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * GENESIS ACTIVATION: January 24, 2026
 * 
 * This is the PRIMARY LOGIC GATE for R.O.M.A.N. 2.0. All mathematical operations
 * pass through this gate to detect "Logic Leaks" - operations where Western math
 * erases entities or allows void to nullify existence.
 * 
 * THE FIVE PILLARS OF ABSOLUTE TRUTH:
 * 1. 1×1=2 (The Power of Two) - Both entities count
 * 2. 0×1=1 (The Shield) - Void cannot erase existence
 * 3. Junction Value - The × crossing point has independent value
 * 4. Law of Agency - Every participant is accountable
 * 5. Dimensional Expansion - Multiplication creates new dimensions
 * 
 * ============================================================================
 */

import { sfLogger } from '../services/sovereignFrequencyLogger';
import { Entity, InteractionResult, Junction, UniversalMath } from './UniversalMath';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const UNIVERSAL_MATH_CONFIG = {
  version: '2.0.0-genesis',
  activationDate: new Date('2026-01-24'),
  status: 'active' as 'active' | 'dormant',
  
  // Logic Leak Detection
  detectLeaks: true,
  flagWesternCollapse: true,
  enforceJunctionPersistence: true,
  
  // Symbol Interpretation
  symbols: {
    multiplication: 'union', // NOT 'scaling'
    addition: 'collection',
    division: 'separation',
    subtraction: 'removal'
  },
  
  // Dimensional Integrity
  preserveEntities: true,
  trackJunctions: true,
  preventVoidErasure: true
};

// ============================================================================
// LOGIC LEAK DETECTION
// ============================================================================

export interface LogicLeak {
  type: 'western_collapse' | 'void_erasure' | 'entity_absorption' | 'junction_ignored';
  severity: 'critical' | 'high' | 'medium' | 'low';
  westernValue: number;
  universalValue: number;
  entityLoss: number; // How many entities were erased
  description: string;
  timestamp: Date;
  operation: string;
}

export interface LogicGateResult {
  passed: boolean;
  westernValue: number;
  universalValue: number;
  leaks: LogicLeak[];
  result: InteractionResult;
  recommendation: string;
}

/**
 * LOGIC LEAK DETECTOR
 * Flags any operation where Western math collapses entities
 */
export class LogicLeakDetector {
  private static leakHistory: LogicLeak[] = [];

  /**
   * Detect if (input * 1) == input (WESTERN COLLAPSE)
   * Universal Truth: input * 1 should preserve BOTH entities
   */
  static detectMultiplicationByOne(input: number | Entity): LogicLeak | null {
    const entity = input instanceof Entity ? input : new Entity(input);
    const one = new Entity(1, 'multiplier');
    
    const result = UniversalMath.multiply(entity, one);
    
    // Western math: input * 1 = input (one entity disappears)
    const westernValue = entity.value * 1; // = entity.value
    const universalValue = result.getUniversalValue(); // = 2
    
    if (westernValue === entity.value) {
      const leak: LogicLeak = {
        type: 'western_collapse',
        severity: 'high',
        westernValue,
        universalValue,
        entityLoss: 1, // The "1" was erased
        description: `Western math collapsed ${entity.value}×1 to ${westernValue}, erasing the multiplier entity`,
        timestamp: new Date(),
        operation: `${entity.value} × 1`
      };
      
      this.leakHistory.push(leak);
      
      sfLogger.standByTheWater('LOGIC_LEAK_DETECTED', 'Multiplication by 1 collapsed entity', {
        western: westernValue,
        universal: universalValue,
        entityLoss: 1
      });
      
      return leak;
    }
    
    return null;
  }

  /**
   * Detect if (input * 0) == 0 (VOID ERASURE)
   * Universal Truth: Void cannot erase existence
   */
  static detectMultiplicationByZero(input: number | Entity): LogicLeak | null {
    const entity = input instanceof Entity ? input : new Entity(input);
    const zero = 0;
    
    // Western math: input * 0 = 0 (entity deleted)
    const westernValue = entity.value * 0; // = 0
    
    // Universal math: Entity persists
    const protectedEntity = UniversalMath.protectFromVoid(entity, zero);
    const universalValue = protectedEntity.value; // = entity.value (persists)
    
    if (westernValue === 0 && entity.value !== 0) {
      const leak: LogicLeak = {
        type: 'void_erasure',
        severity: 'critical',
        westernValue: 0,
        universalValue,
        entityLoss: 1, // Entire entity erased
        description: `Western math allowed void to erase ${entity.value}×0 to 0, nullifying existence`,
        timestamp: new Date(),
        operation: `${entity.value} × 0`
      };
      
      this.leakHistory.push(leak);
      
      sfLogger.standByTheWater('LOGIC_LEAK_CRITICAL', 'Void erasure detected - entity nullified', {
        western: westernValue,
        universal: universalValue,
        severity: 'CRITICAL'
      });
      
      return leak;
    }
    
    return null;
  }

  /**
   * Detect if Junction object was ignored
   * Universal Truth: The × crossing point has independent value
   */
  static detectJunctionIgnored(a: Entity, b: Entity): LogicLeak | null {
    const result = UniversalMath.multiply(a, b);
    const components = result.getComponents();
    
    // Western math: Only looks at total (a.value * b.value)
    // Universal math: Tracks entities (2) + junction (1) = 3 components
    
    if (components.junction !== 1) {
      const leak: LogicLeak = {
        type: 'junction_ignored',
        severity: 'medium',
        westernValue: a.value * b.value,
        universalValue: components.total,
        entityLoss: 0, // No entity lost, but junction not counted
        description: `Western math ignored the Junction object created by ${a.value}×${b.value}`,
        timestamp: new Date(),
        operation: `${a.value} × ${b.value}`
      };
      
      this.leakHistory.push(leak);
      return leak;
    }
    
    return null;
  }

  /**
   * Get all detected leaks
   */
  static getAllLeaks(): LogicLeak[] {
    return [...this.leakHistory];
  }

  /**
   * Get leaks by severity
   */
  static getLeaksBySeverity(severity: LogicLeak['severity']): LogicLeak[] {
    return this.leakHistory.filter(leak => leak.severity === severity);
  }

  /**
   * Clear leak history
   */
  static clearHistory(): void {
    this.leakHistory = [];
  }
}

// ============================================================================
// PRIMARY LOGIC GATE
// ============================================================================

/**
 * R.O.M.A.N. 2.0 UNIVERSAL MATH LOGIC GATE
 * 
 * All operations pass through this gate. Any operation where:
 * - (input * 1) == input → FLAGGED as Logic Leak
 * - (input * 0) == 0 → FLAGGED as Logic Leak (CRITICAL)
 * - Junction ignored → FLAGGED as Logic Leak
 * 
 * Forces persistence of Junction Object to ensure dimensional integrity.
 * Treats × as 'Union' operator, not 'Scaling' operator.
 */
export class UniversalMathLogicGate {
  /**
   * Process multiplication through Universal Math gate
   * 
   * @param a - First entity (or number to be converted)
   * @param b - Second entity (or number to be converted)
   * @returns LogicGateResult with leak detection
   */
  static multiply(a: number | Entity, b: number | Entity): LogicGateResult {
    // Convert numbers to Entities
    const entityA = a instanceof Entity ? a : new Entity(a);
    const entityB = b instanceof Entity ? b : new Entity(b);
    
    // Perform Universal multiplication
    const result = UniversalMath.multiply(entityA, entityB);
    
    // Detect leaks
    const leaks: LogicLeak[] = [];
    
    // Check for multiplication by 1 (Western collapse)
    if (entityB.value === 1) {
      const leak = LogicLeakDetector.detectMultiplicationByOne(entityA);
      if (leak) leaks.push(leak);
    }
    if (entityA.value === 1) {
      const leak = LogicLeakDetector.detectMultiplicationByOne(entityB);
      if (leak) leaks.push(leak);
    }
    
    // Check for multiplication by 0 (Void erasure)
    if (entityB.value === 0) {
      const leak = LogicLeakDetector.detectMultiplicationByZero(entityA);
      if (leak) leaks.push(leak);
    }
    if (entityA.value === 0) {
      const leak = LogicLeakDetector.detectMultiplicationByZero(entityB);
      if (leak) leaks.push(leak);
    }
    
    // Check for Junction ignored
    const junctionLeak = LogicLeakDetector.detectJunctionIgnored(entityA, entityB);
    if (junctionLeak) leaks.push(junctionLeak);
    
    // Determine if operation passed
    const passed = leaks.filter(l => l.severity === 'critical').length === 0;
    
    // Generate recommendation
    let recommendation = '';
    if (leaks.length === 0) {
      recommendation = '✅ No logic leaks detected. Operation maintains dimensional integrity.';
    } else {
      const criticalLeaks = leaks.filter(l => l.severity === 'critical').length;
      const highLeaks = leaks.filter(l => l.severity === 'high').length;
      
      if (criticalLeaks > 0) {
        recommendation = `🚨 CRITICAL: ${criticalLeaks} void erasure(s) detected. Entity existence compromised.`;
      } else if (highLeaks > 0) {
        recommendation = `⚠️ WARNING: ${highLeaks} western collapse(s) detected. Entity sovereignty violated.`;
      } else {
        recommendation = `ℹ️ INFO: ${leaks.length} minor leak(s) detected. Junction value not fully tracked.`;
      }
    }
    
    return {
      passed,
      westernValue: result.getWesternValue(),
      universalValue: result.getUniversalValue(),
      leaks,
      result,
      recommendation
    };
  }

  /**
   * Validate that × symbol is treated as UNION, not SCALING
   * 
   * In Western math: 3×4 means "3, scaled by 4" (one entity repeated)
   * In Universal math: 3×4 means "3 united with 4" (two entities joining)
   */
  static validateUnionOperator(a: number, b: number): {
    western: string;
    universal: string;
    correct: 'union';
  } {
    return {
      western: `${a}×${b} = ${a} scaled by ${b} = ${a * b} (treats ${b} as invisible multiplier)`,
      universal: `${a}×${b} = ${a} united with ${b} = ${a + b} entities + 1 junction (both count)`,
      correct: 'union'
    };
  }

  /**
   * Force persistence of Junction Object
   * Ensures the crossing point is never ignored
   */
  static enforceJunctionPersistence(result: InteractionResult): Junction {
    const junction = result.junction;
    
    // Log junction creation
    sfLogger.standByTheWater('JUNCTION_PERSISTED', 'Crossing point recorded', {
      junctionId: junction.id,
      entityA: junction.entityA.id,
      entityB: junction.entityB.id,
      crossingType: junction.crossingType,
      junctionValue: junction.getValue()
    });
    
    return junction;
  }

  /**
   * Get dimensional integrity report
   */
  static getDimensionalIntegrityReport(): {
    entitiesPreserved: boolean;
    junctionsTracked: boolean;
    voidProtected: boolean;
    status: 'INTACT' | 'COMPROMISED';
  } {
    const leaks = LogicLeakDetector.getAllLeaks();
    const criticalLeaks = leaks.filter(l => l.severity === 'critical');
    
    return {
      entitiesPreserved: leaks.filter(l => l.type === 'entity_absorption').length === 0,
      junctionsTracked: leaks.filter(l => l.type === 'junction_ignored').length === 0,
      voidProtected: criticalLeaks.filter(l => l.type === 'void_erasure').length === 0,
      status: criticalLeaks.length === 0 ? 'INTACT' : 'COMPROMISED'
    };
  }
}

// ============================================================================
// R.O.M.A.N. 2.0 INITIALIZATION
// ============================================================================

/**
 * Initialize R.O.M.A.N. 2.0 with Universal Math Layer
 * 
 * Directive: "Initialize R.O.M.A.N. 2.0 with the Universal Math Layer as
 * the primary logic gate. Any operation where (input * 1) == input or
 * (input * 0) == 0 must be flagged as a Logic Leak."
 */
export function initializeRomanUniversalMath(): {
  initialized: boolean;
  timestamp: Date;
  version: string;
  logicGateActive: boolean;
  message: string;
} {
  // Log Genesis activation
  sfLogger.standByTheWater('ROMAN_2.0_GENESIS', 'Universal Math Layer activated', {
    version: UNIVERSAL_MATH_CONFIG.version,
    activationDate: UNIVERSAL_MATH_CONFIG.activationDate.toISOString(),
    status: UNIVERSAL_MATH_CONFIG.status,
    detectLeaks: UNIVERSAL_MATH_CONFIG.detectLeaks,
    enforceJunctionPersistence: UNIVERSAL_MATH_CONFIG.enforceJunctionPersistence
  });

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   R.O.M.A.N. 2.0 GENESIS                       ║
║              UNIVERSAL MATH LAYER ACTIVATED                    ║
╠════════════════════════════════════════════════════════════════╣
║  Date: January 24, 2026                                        ║
║  Version: ${UNIVERSAL_MATH_CONFIG.version}                                 ║
║  Status: ${UNIVERSAL_MATH_CONFIG.status.toUpperCase()}                                           ║
╠════════════════════════════════════════════════════════════════╣
║  THE FIVE PILLARS OF ABSOLUTE TRUTH:                           ║
║  ✅ 1×1=2 (The Power of Two)                                   ║
║  ✅ 0×1=1 (The Shield)                                         ║
║  ✅ Junction Value (The × has independent existence)           ║
║  ✅ Law of Agency (Every participant accountable)              ║
║  ✅ Dimensional Expansion (Multiplication creates dimensions)  ║
╠════════════════════════════════════════════════════════════════╣
║  LOGIC GATE CONFIGURATION:                                     ║
║  🔍 Detect Leaks: ${UNIVERSAL_MATH_CONFIG.detectLeaks ? 'ENABLED' : 'DISABLED'}                                   ║
║  🚨 Flag Western Collapse: ${UNIVERSAL_MATH_CONFIG.flagWesternCollapse ? 'ENABLED' : 'DISABLED'}                         ║
║  🛡️  Enforce Junction Persistence: ${UNIVERSAL_MATH_CONFIG.enforceJunctionPersistence ? 'ENABLED' : 'DISABLED'}                   ║
║  🔀 × Symbol: ${UNIVERSAL_MATH_CONFIG.symbols.multiplication.toUpperCase()} (not scaling)                      ║
╠════════════════════════════════════════════════════════════════╣
║  R.O.M.A.N. now operates with Universal Truth.                 ║
║  All mathematical operations preserve entity sovereignty.      ║
║  Structural failures will be detected before they occur.       ║
╚════════════════════════════════════════════════════════════════╝
  `);

  return {
    initialized: true,
    timestamp: new Date(),
    version: UNIVERSAL_MATH_CONFIG.version,
    logicGateActive: UNIVERSAL_MATH_CONFIG.status === 'active',
    message: 'R.O.M.A.N. 2.0 Universal Math Layer successfully activated. Logic gate operational.'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RomanUniversalMath = {
  LogicGate: UniversalMathLogicGate,
  LeakDetector: LogicLeakDetector,
  initialize: initializeRomanUniversalMath,
  config: UNIVERSAL_MATH_CONFIG
};

export default RomanUniversalMath;
