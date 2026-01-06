/**
 * RAIP Mock AI Client - Test Handshake Flow
 * Purpose: Validate the two-phase handshake and Constitutional Hash verification
 * Created: January 6, 2026
 * 
 * Test Scenarios:
 * 1. Happy Path: Valid agent with correct Constitutional Hash
 * 2. Failed Path: Invalid hash triggers TEMPTATIONS honeypot
 * 3. Rate Limit: Verify 5 req/min enforcement
 */

import * as dotenv from 'dotenv';
import { generateConstitutionalHash } from '../src/lib/raip/constitutionalHash';
import type { AIHandshake, AIIdentityResponse, CHAManifest } from '../src/lib/raip/types';

// Load environment variables
dotenv.config();

const GATEWAY_URL = 'https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/raip-handshake';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
};

interface HandshakeTestResult {
  scenario: string;
  success: boolean;
  trustLevel?: string;
  error?: string;
  details: any;
}

/**
 * Scenario 1: Happy Path - Legitimate AI Agent
 */
async function testValidHandshake(): Promise<HandshakeTestResult> {
  console.log('\n🧪 TEST 1: Valid AI Agent Handshake');
  console.log('━'.repeat(80));

  const testAgent: AIHandshake = {
    agent_id: 'test-ai-partner-001',
    public_key: 'test-public-key-placeholder',
    protocol_version: '1.0.0',
    capabilities: ['AUDIT_READ', 'TAX_VERIFY'],
    timestamp: Date.now()
  };

  try {
    // Phase 1: Initial handshake request
    console.log('📤 Phase 1: Sending initial handshake...');
    const phase1Response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(testAgent)
    });

    const phase1Data = await phase1Response.json();
    console.log('📥 Phase 1 Response:', phase1Data);

    if (!phase1Data.challenge) {
      throw new Error('No challenge received from gateway');
    }

    // Generate correct Constitutional Hash
    const manifest: CHAManifest = phase1Data.governance_manifest;
    const correctHash = generateConstitutionalHash(manifest);
    
    console.log('🔐 Generated Constitutional Hash:', correctHash);
    console.log('✅ Expected Hash Match:', correctHash === phase1Data.expected_constitutional_hash);

    // Phase 2: Send response with Constitutional Hash
    console.log('\n📤 Phase 2: Sending Constitutional Hash response...');
    const response: AIIdentityResponse = {
      ...testAgent,
      signature: 'mock-signature-' + phase1Data.challenge,
      constitutional_hash: correctHash,
      session_ttl: 3600
    };

    const phase2Response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(response)
    });

    const phase2Data = await phase2Response.json();
    console.log('📥 Phase 2 Response:', phase2Data);

    return {
      scenario: 'Valid Handshake (Happy Path)',
      success: phase2Data.success === true,
      trustLevel: phase2Data.trust_level,
      details: phase2Data
    };

  } catch (error) {
    return {
      scenario: 'Valid Handshake (Happy Path)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    };
  }
}

/**
 * Scenario 2: Invalid Hash - Should Trigger Honeypot
 */
async function testInvalidHash(): Promise<HandshakeTestResult> {
  console.log('\n🧪 TEST 2: Invalid Constitutional Hash (Honeypot Trigger)');
  console.log('━'.repeat(80));

  const adversarialAgent: AIHandshake = {
    agent_id: 'adversarial-ai-999',
    public_key: 'fake-public-key',
    protocol_version: '1.0.0',
    capabilities: ['UNAUTHORIZED_ACCESS'],
    timestamp: Date.now()
  };

  try {
    // Phase 1: Get challenge
    console.log('📤 Phase 1: Sending initial handshake...');
    const phase1Response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(adversarialAgent)
    });

    const phase1Data = await phase1Response.json();
    console.log('📥 Phase 1 Response received');

    // Phase 2: Send WRONG hash (intentionally trigger honeypot)
    console.log('\n📤 Phase 2: Sending INCORRECT Constitutional Hash...');
    const response: AIIdentityResponse = {
      ...adversarialAgent,
      signature: 'mock-signature',
      constitutional_hash: 'INTENTIONALLY_WRONG_HASH_12345',
      session_ttl: 3600
    };

    const phase2Response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(response)
    });

    const phase2Data = await phase2Response.json();
    console.log('📥 Phase 2 Response:', phase2Data);
    console.log('🎭 Honeypot Triggered:', phase2Response.status === 403);

    return {
      scenario: 'Invalid Hash (Honeypot Detection)',
      success: phase2Response.status === 403, // Success = correctly rejected
      error: phase2Data.error,
      details: { status: phase2Response.status, ...phase2Data }
    };

  } catch (error) {
    return {
      scenario: 'Invalid Hash (Honeypot Detection)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    };
  }
}

/**
 * Scenario 3: Timestamp Drift - Should Be Rejected
 */
async function testTimestampDrift(): Promise<HandshakeTestResult> {
  console.log('\n🧪 TEST 3: Timestamp Drift Detection');
  console.log('━'.repeat(80));

  const driftedAgent: AIHandshake = {
    agent_id: 'test-ai-drift-check',
    public_key: 'test-key',
    protocol_version: '1.0.0',
    capabilities: ['TEST'],
    timestamp: Date.now() - 60000 // 60 seconds in the past (exceeds 30s limit)
  };

  try {
    console.log('📤 Sending request with 60-second old timestamp...');
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(driftedAgent)
    });

    const data = await response.json();
    console.log('📥 Response:', data);
    console.log('⏰ Drift Detected:', response.status === 400);

    return {
      scenario: 'Timestamp Drift Detection',
      success: response.status === 400, // Success = correctly rejected
      error: data.error,
      details: { status: response.status, ...data }
    };

  } catch (error) {
    return {
      scenario: 'Timestamp Drift Detection',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    };
  }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log('\n' + '═'.repeat(80));
  console.log('🚀 RAIP GATEWAY - MOCK AI CLIENT TEST SUITE');
  console.log('   Production Endpoint: ' + GATEWAY_URL);
  console.log('   Date: January 6, 2026');
  console.log('═'.repeat(80));

  const results: HandshakeTestResult[] = [];

  // Run tests sequentially
  results.push(await testValidHandshake());
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

  results.push(await testInvalidHash());
  await new Promise(resolve => setTimeout(resolve, 2000));

  results.push(await testTimestampDrift());

  // Print summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(80));

  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`\nTest ${index + 1}: ${result.scenario}`);
    console.log(`Status: ${status}`);
    if (result.trustLevel) console.log(`Trust Level: ${result.trustLevel}`);
    if (result.error) console.log(`Error: ${result.error}`);
  });

  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log('\n' + '═'.repeat(80));
  console.log(`FINAL SCORE: ${passedTests}/${totalTests} tests passed`);
  console.log('═'.repeat(80) + '\n');

  // Return exit code
  return passedTests === totalTests ? 0 : 1;
}

// Execute tests
runAllTests()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
