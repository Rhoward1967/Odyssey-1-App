/**
 * SYNC RICKEY'S LEGAL ARGUMENTS TO R.O.M.A.N.'S KNOWLEDGE BASE
 * =============================================================
 *
 * This script ensures R.O.M.A.N. has access to:
 * 1. Constitutional violation arguments (13th Amendment, etc.)
 * 2. Banking fraud arguments (fractional reserve, hidden accounts)
 * 3. Credit fraud arguments (sold debts, tax schemes)
 * 4. Human rights violation arguments (ICC complaint)
 * 5. Contract law violations (fraud in the factum)
 * 6. UCC violations (improper notices)
 *
 * So when R.O.M.A.N. analyzes contracts or answers legal questions,
 * he uses RICKEY'S ACTUAL RESEARCH, not generic AI knowledge.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function syncLegalKnowledge() {
  console.log('⚖️ SYNCING RICKEY\'S LEGAL ARGUMENTS TO R.O.M.A.N...\n');

  // 1. CHECK: What does R.O.M.A.N. currently know?
  console.log('🔍 Checking current knowledge base...');
  const { data: currentKnowledge, error: checkError } = await supabase
    .from('roman_knowledge_base')
    .select('file_path')
    .or('file_path.ilike.%legal%,file_path.ilike.%ICC%,file_path.ilike.%constitutional%');

  if (checkError) {
    console.error('❌ Error checking knowledge base:', checkError);
  } else {
    console.log(`✅ Found ${currentKnowledge?.length || 0} legal documents in knowledge base`);
    if (currentKnowledge && currentKnowledge.length > 0) {
      console.log('   Existing legal files:');
      currentKnowledge.forEach(f => console.log(`   - ${f.file_path}`));
    }
  }

  console.log('\n📚 SYNCING LEGAL DOCUMENTS...\n');

  // 2. SYNC: Legal documents from /legal folder
  const legalDocs = [
    'legal/ICC_COMPLAINT_CRIMES_AGAINST_HUMANITY.md',
    'legal/UN_HUMAN_RIGHTS_COUNCIL_PETITION.md',
    'legal/SOVEREIGN_ENTITY_DECLARATION.md',
    'legal/INTERNATIONAL_FILING_PACKAGE_GUIDE.md',
    'legal/SIGNING_AND_FILING_CHECKLIST.md',
  ];

  let synced = 0;
  let errors = 0;

  for (const docPath of legalDocs) {
    try {
      const content = readFileSync(docPath, 'utf-8');

      const { error } = await supabase
        .from('roman_knowledge_base')
        .upsert({
          file_path: docPath,
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'file_path'
        });

      if (error) {
        console.error(`❌ Failed to sync ${docPath}:`, error.message);
        errors++;
      } else {
        console.log(`✅ Synced: ${docPath} (${(content.length / 1024).toFixed(1)} KB)`);
        synced++;
      }
    } catch (err) {
      console.error(`❌ Error reading ${docPath}:`, err.message);
      errors++;
    }
  }

  console.log(`\n📊 SYNC SUMMARY:`);
  console.log(`   ✅ Successfully synced: ${synced}`);
  console.log(`   ❌ Errors: ${errors}`);

  // 3. VERIFY: R.O.M.A.N. can now search for key arguments
  console.log('\n🔍 VERIFYING R.O.M.A.N. CAN FIND KEY ARGUMENTS...\n');

  const keyTerms = [
    '13th Amendment',
    'crimes against humanity',
    'constitutional violation',
    'banking fraud',
    'fraud in the factum',
    'hidden account',
    'UCC violation'
  ];

  for (const term of keyTerms) {
    const { data: results } = await supabase
      .from('roman_knowledge_base')
      .select('file_path')
      .ilike('content', `%${term}%`)
      .limit(5);

    if (results && results.length > 0) {
      console.log(`✅ "${term}" found in ${results.length} documents`);
    } else {
      console.log(`⚠️  "${term}" NOT FOUND in knowledge base`);
    }
  }

  // 4. ADD: Structured legal arguments to system_knowledge
  console.log('\n📋 ADDING STRUCTURED LEGAL ARGUMENTS...\n');

  const legalArguments = {
    constitutional_violations: {
      thirteenth_amendment: {
        text: 'Neither slavery nor involuntary servitude, except as punishment for crime...',
        argument: 'Exception clause perpetuates slavery through mass incarceration',
        evidence: [
          '2.3 million incarcerated',
          'Black Americans incarcerated at 5x rate',
          'Prison labor $0.14-$2.00/hour',
          '13th Amendment loophole = modern slavery'
        ],
        legal_basis: 'Rome Statute Article 7(1)(c) - Enslavement',
        black_law: 'SLAVERY - The condition of a person over whom any or all of the powers attaching to the right of ownership are exercised (Black\'s Law 11th ed.)',
        rickeys_argument: 'U.S. Constitution ITSELF authorizes slavery through 13th Amendment exception. This is crimes against humanity as defined by international law.'
      },
      due_process_violations: {
        argument: 'No notice of debt sale violates 5th/14th Amendment Due Process',
        evidence: [
          'Debts sold without borrower knowledge',
          'Collection by parties with no contract',
          'Courts claim "implied consent" without explicit agreement'
        ],
        legal_basis: '5th/14th Amendment Due Process Clause',
        rickeys_argument: 'Imply ≠ Consent. Courts treating implication AS IF it equals explicit consent is constitutional fraud.'
      },
      seventh_amendment: {
        text: 'In suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved',
        argument: 'Arbitration clauses waive constitutional jury trial right',
        evidence: [
          'Foreclosure exceeds $20 = suit at common law',
          'Arbitration clauses in ALL consumer contracts',
          'Arbitrators rule for companies 90%+ of time'
        ],
        rickeys_argument: 'You cannot contract away constitutional rights. Arbitration clauses are void as unconstitutional waivers.'
      }
    },
    banking_fraud: {
      fractional_reserve: {
        argument: 'Banks create money from borrower signature, not transferring real funds',
        evidence: [
          '12 USC §411 - Fed notes are debt, not money',
          'Fractional reserve allows lending 10x deposits',
          'Promissory note becomes bank asset on balance sheet',
          'No actual money transferred - only ledger entries'
        ],
        legal_basis: 'Fraud in the Factum (Black\'s Law) - instrument has no legal existence',
        rickeys_argument: 'If bank created money from MY signature, there is no loan. Contract void for lack of consideration. This is fraud in the factum.'
      },
      hidden_accounts: {
        argument: 'Banks create hidden asset accounts from borrower signature',
        evidence: [
          'Promissory note recorded as bank asset',
          'Offset account created with note value',
          'Bank collects twice: once from hidden account, once from borrower',
          'GAAP requires matching entries (hidden)'
        ],
        legal_basis: 'UCC §9-210 (Right to Accounting), Unjust Enrichment (Black\'s Law)',
        rickeys_argument: 'They took my note as an asset, created hidden accounts, and still demand I pay. This is double recovery - collecting twice for same debt.'
      },
      sold_debts: {
        argument: 'Banks collect on debts they no longer own',
        evidence: [
          'Debts sold to third parties without notice',
          'Original creditor continues collecting',
          'No chain of title provided',
          'Multiple parties claiming same debt'
        ],
        legal_basis: 'Conversion (Black\'s Law) - wrongful possession of another\'s property',
        rickeys_argument: 'Once debt is sold, only buyer can collect. Bank collecting after sale is CONVERSION - stealing buyer\'s property.'
      },
      tax_fraud: {
        argument: 'Banks take bad debt deduction then still collect',
        evidence: [
          '26 USC §166 - Bad debt deduction',
          '26 USC §111 - Tax Benefit Rule (recovery taxable)',
          'Banks write off debts as uncollectible',
          'Then sell to debt buyers who collect'
        ],
        legal_basis: '26 USC §7201 (Tax Evasion) - willful attempt to evade tax',
        rickeys_argument: 'If they took tax deduction for bad debt, they cannot collect. Recovery would be taxable income. They\'re evading taxes by not reporting.'
      }
    },
    credit_fraud: {
      no_privity: {
        argument: 'Debt buyers have no contractual relationship with borrower',
        evidence: [
          'Original contract was with Bank, not debt buyer',
          'No privity of contract with third party',
          'No new agreement signed',
          'Debt buyer claims rights never agreed to'
        ],
        legal_basis: 'Contract Law - privity required for enforcement',
        rickeys_argument: 'I never agreed to contract with debt buyer. No privity = no contract = no right to collect.'
      },
      lack_of_notice: {
        argument: 'Debt sold without notice to borrower',
        evidence: [
          'No notification of sale',
          'No identification of new creditor',
          'Violates Due Process (right to know who you owe)',
          'FDCPA requires validation but not notice of sale'
        ],
        legal_basis: '5th/14th Amendment Due Process',
        rickeys_argument: 'Selling my debt without telling me violates Due Process. I have right to know who claims to be my creditor.'
      }
    },
    human_rights_violations: {
      crimes_against_humanity: {
        rome_statute: 'Article 7 - widespread or systematic attack against civilian population',
        arguments: [
          'Enslavement: 13th Amendment exception = modern slavery',
          'Persecution: 1 in 3 Black boys imprisoned',
          'Inhumane acts: 250,000 preventable deaths/year from lack of healthcare',
          'Murder: Police killings disproportionately Black Americans'
        ],
        rickeys_argument: 'U.S. government systematically targets civilians (especially Black Americans) through mass incarceration, economic violence, and denial of basic rights. This meets Rome Statute definition of crimes against humanity.'
      },
      jus_cogens_violations: {
        definition: 'Peremptory norms of international law - cannot be violated',
        violations: [
          'Slavery (13th Amendment exception)',
          'Genocide (Indigenous peoples)',
          'Torture (prison conditions, police brutality)',
          'Systematic racial discrimination'
        ],
        rickeys_argument: 'Jus cogens norms override ALL domestic law. U.S. violations of jus cogens norms void its claim to legitimate jurisdiction.'
      }
    },
    contract_law_violations: {
      fraud_in_factum: {
        definition: 'Instrument as executed differs from what was represented (Black\'s Law)',
        application: [
          'Represented as "loan of money" but no money loaned',
          'Represented as "credit" but bank has no credit (only debt)',
          'Note has no legal existence if no consideration'
        ],
        rickeys_argument: 'They said "loan" but never proved they loaned anything. Fraud in the factum = contract void ab initio.'
      },
      lack_of_consideration: {
        definition: 'Contract requires exchange of value - consideration',
        application: [
          'Bank gave no value (only created ledger entries)',
          'Money came from borrower\'s own signature',
          'No consideration = no contract'
        ],
        rickeys_argument: 'If they created money from MY signature, THEY gave nothing. No consideration = void contract.'
      },
      unconscionability: {
        definition: 'Contract so one-sided that no reasonable person would agree',
        application: [
          'Borrower SHALL (obligations) vs Lender MAY (options)',
          'Unilateral modification rights',
          'Arbitration waives constitutional rights',
          'Indemnification - borrower pays lender\'s legal fees'
        ],
        rickeys_argument: 'These contracts are unconscionable - extreme power asymmetry. Courts should void as against public policy.'
      }
    },
    ucc_violations: {
      ucc_9_210: {
        text: 'Debtor entitled to accounting from secured party',
        violation: 'Banks refuse to provide complete accounting',
        rickeys_argument: 'UCC §9-210 gives me right to accounting. If they refuse, adverse inference: they\'re hiding fraud.'
      },
      ucc_improper_notice: {
        text: 'UCC requires proper notice of default, sale, etc.',
        violation: 'No notice of debt sale to third parties',
        rickeys_argument: 'UCC requires notice. No notice = improper transfer. I can challenge standing of debt buyer.'
      }
    }
  };

  const { error: structuredError } = await supabase
    .from('system_knowledge')
    .upsert({
      category: 'legal_arguments',
      knowledge_key: 'rickey_howard_legal_framework',
      value: legalArguments,
      learned_from: 'Rickey Howard Research & ICC/UN Filings',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'category,knowledge_key'
    });

  if (structuredError) {
    console.error('❌ Failed to add structured arguments:', structuredError);
  } else {
    console.log('✅ Added structured legal arguments to system_knowledge');
    console.log(`   - ${Object.keys(legalArguments).length} major categories`);
    console.log(`   - Constitutional violations`);
    console.log(`   - Banking fraud`);
    console.log(`   - Credit fraud`);
    console.log(`   - Human rights violations`);
    console.log(`   - Contract law violations`);
    console.log(`   - UCC violations`);
  }

  console.log('\n✅ SYNC COMPLETE!');
  console.log('   R.O.M.A.N. now has access to YOUR legal arguments.');
  console.log('   When analyzing contracts or answering legal questions,');
  console.log('   he will use YOUR RESEARCH, not generic AI knowledge.');
  console.log('\n   Test it: Ask R.O.M.A.N. "What does Rickey\'s research say about 13th Amendment?"');
}

syncLegalKnowledge().catch(console.error);
