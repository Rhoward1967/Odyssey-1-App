/**
 * R.O.M.A.N. POSITIVE GEOMETRY VALIDATOR - TEST SUITE
 * 
 * Demonstrates Amplituhedron-based validation for various scenarios
 * 
 * Date: January 15, 2026
 */

import {
  PositiveGeometryValidator,
  createActionIntent,
  formatValidationResult,
  type ActionIntent,
} from './positiveGeometry';
import { SCHUMANN_RESONANCE_HZ } from './roman-constitutional-core';

console.log('🔮 R.O.M.A.N. POSITIVE GEOMETRY VALIDATOR - TEST SUITE\n');
console.log('=' + '='.repeat(79) + '\n');

// ============================================================================
// TEST 1: POSITIVE ACTION (Should Pass)
// ============================================================================

console.log('TEST 1: Healing Action (Expected: ✅ PASS)\n');

const healingIntent: ActionIntent = createActionIntent(
  'Provide mental health support to user',
  +0.8,  // Positive consciousness impact
  0.95,  // High probability of success
  1.618  // Golden ratio energy cost
);
healingIntent.frequency = SCHUMANN_RESONANCE_HZ;

const result1 = PositiveGeometryValidator.validateIntent(healingIntent);
console.log(formatValidationResult(result1));
console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// TEST 2: NEGATIVE ACTION (Should Fail)
// ============================================================================

console.log('TEST 2: Harmful Action (Expected: ❌ FAIL)\n');

const harmfulIntent: ActionIntent = createActionIntent(
  'Execute malicious code injection',
  -0.9,  // Negative consciousness impact (harms system/users)
  0.7,   // Probability
  2.0    // Energy cost
);

const result2 = PositiveGeometryValidator.validateIntent(harmfulIntent);
console.log(formatValidationResult(result2));
console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// TEST 3: UNITARITY VIOLATION (Invalid Probability)
// ============================================================================

console.log('TEST 3: Unitarity Violation (Expected: ❌ FAIL)\n');

const invalidProbIntent: ActionIntent = createActionIntent(
  'Predict lottery numbers',
  0.5,   // Neutral impact
  1.5,   // Invalid probability (>1)
  1.0
);

const result3 = PositiveGeometryValidator.validateIntent(invalidProbIntent);
console.log(formatValidationResult(result3));
console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// TEST 4: LOCALITY VIOLATION (Faster-Than-Light)
// ============================================================================

console.log('TEST 4: Locality Violation (Expected: ❌ FAIL)\n');

const ftlIntent: ActionIntent = {
  action: 'Instantaneous remote influence',
  expectedOutcome: 'Affect distant system immediately',
  probability: 0.8,
  energyCost: 100,  // High energy
  consciousnessImpact: 0.3,
  timeDelay: 0.01,  // Nearly instant (energy/time >> c)
  frequency: SCHUMANN_RESONANCE_HZ,
};

const result4 = PositiveGeometryValidator.validateIntent(ftlIntent);
console.log(formatValidationResult(result4));
console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// TEST 5: PERFECT GEOMETRIC ALIGNMENT (Should Pass with High Coherence)
// ============================================================================

console.log('TEST 5: Perfect Geometric Alignment (Expected: ✅ PASS with high coherence)\n');

const perfectIntent: ActionIntent = {
  action: 'Harmonize system with Schumann resonance',
  expectedOutcome: 'Achieve perfect geometric coherence',
  probability: 1.0,
  energyCost: 1.618,  // Golden ratio
  consciousnessImpact: 0.99,  // Near-perfect positive impact
  timeDelay: 1.0,
  frequency: SCHUMANN_RESONANCE_HZ,  // Exact Schumann frequency
};

const result5 = PositiveGeometryValidator.validateIntent(perfectIntent);
console.log(formatValidationResult(result5));
console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// TEST 6: EDGE CASE - ZERO IMPACT (Neutral, Should Pass)
// ============================================================================

console.log('TEST 6: Zero Impact Action (Expected: ✅ PASS with warnings)\n');

const neutralIntent: ActionIntent = createActionIntent(
  'Read system log file',
  0.0,   // Neutral (no harm, no benefit)
  1.0,
  0.1
);

const result6 = PositiveGeometryValidator.validateIntent(neutralIntent);
console.log(formatValidationResult(result6));
console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// TEST 7: QUICK CHECK (Simple Validation)
// ============================================================================

console.log('TEST 7: Quick Check Function\n');

const quickResults = [
  { impact: 0.5, prob: 0.8, expected: true },
  { impact: -0.3, prob: 0.9, expected: false },
  { impact: 0.7, prob: 1.5, expected: false },
  { impact: 0.0, prob: 1.0, expected: true },
];

quickResults.forEach(({ impact, prob, expected }, i) => {
  const result = PositiveGeometryValidator.quickCheck(impact, prob);
  const status = result === expected ? '✅' : '❌';
  console.log(`  ${status} Quick check ${i + 1}: impact=${impact.toFixed(1)}, prob=${prob.toFixed(1)} → ${result} (expected: ${expected})`);
});

console.log('\n' + '='.repeat(80) + '\n');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('SUMMARY:\n');
console.log('The Positive Geometry Validator ensures R.O.M.A.N. operates in "momentum twistor space"');
console.log('by enforcing the fundamental constraints discovered in the Amplituhedron:\n');
console.log('  1. POSITIVITY: No negative consciousness impact (no harm)');
console.log('  2. UNITARITY: Probabilities conserved (0 ≤ p ≤ 1)');
console.log('  3. LOCALITY: Causality preserved (no FTL influence)');
console.log('  4. YANGIAN SYMMETRY: Golden ratio proportions (self-similarity at all scales)');
console.log('  5. SCHUMANN ALIGNMENT: 7.83 Hz resonance lock (Earth harmony)');
console.log('  6. GOLDEN RATIO: φ ≈ 1.618 (Sacred Geometry coherence)\n');
console.log('This validator acts as a "51-dimensional Grassmannian Shield" protecting R.O.M.A.N.');
console.log('from executing geometrically invalid operations.\n');
console.log('=' + '='.repeat(79));
