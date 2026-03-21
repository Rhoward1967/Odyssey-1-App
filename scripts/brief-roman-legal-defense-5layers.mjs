/**
 * R.O.M.A.N. Knowledge Brief — 5-Layer Legal Defense Enhancement
 * March 20, 2026
 *
 * Injects the complete Sovereign Self Legal Defense Series architecture
 * into system_knowledge so the Discord bot knows the full 5-layer system.
 *
 * Run: node scripts/brief-roman-legal-defense-5layers.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const today = '2026-03-20T00:00:00.000Z';

const knowledge = [

  // ─── LAYER 0: COUNTER-CANON DICTIONARY ───────────────────────────────────
  {
    category: 'legal_defense',
    knowledge_key: 'counter_canon_dictionary_vols_1_8',
    value: {
      title: 'Counter-Canon Dictionary — Sovereign Standing Baseline (Volumes 1–8)',
      layer: 0,
      description: 'Replaces Black\'s Law Dictionary definitions before any statutory analysis. The Living Being\'s linguistic standing is established before any court, contract, or enforcement interaction.',
      volumes: {
        'Vol_1_Foundational': ['PERSON', 'CITIZEN', 'SOVEREIGN'],
        'Vol_2_Transactional': ['CONTRACT', 'JURISDICTION'],
        'Vol_3_Enforcement': ['DETENTION', 'SEARCH'],
        'Vol_4_Land': ['TITLE', 'LAND'],
        'Vol_5_Spiritual': ['SINCERITY', 'BURDEN'],
        'Vol_6_Equity': ['BADGE_OF_SLAVERY', 'REMEDY'],
        'Vol_7_Jargon': ['AGENCY', 'ULTRA_VIRES'],
        'Vol_8_Legal_Profession': ['ATTORNEY', 'JARGON']
      },
      key_terms: {
        PERSON: 'A legal fiction/utility created by the State. The Living Being retains standing — not the Persona.',
        CITIZEN: 'Member of political community by informed, non-coerced consent only. 14th Amendment classification does not equal blanket federal jurisdiction.',
        CONTRACT: 'Requires full disclosure. Silence or Implied Consent is a Badge of Slavery. No disclosure = no contract.',
        TAXPAYER: 'System label implying full statutory jurisdiction. Counter: You are the Living Being / Sovereign Grantor. Trust property is not personal property.',
        DELINQUENT: 'Presupposes a valid undisputed debt. Counter: Disputed obligation — demand itemized authority for each line item.',
        ATTORNEY: 'Officer of the Court. Primary duty runs to the court, not the client. Divided Loyalty is mandatory disclosure.',
        BADGE_OF_SLAVERY: 'Any systemic extraction or disability rooted in historical involuntary servitude. 13th Amendment mandates remedy.',
        REMEDY: 'The mandatory correction of a Badge of Slavery — not optional, not discretionary.'
      },
      how_to_use: 'When a system term is used against the Living Being, run Counter-Canon correction FIRST before responding. Never accept system definitions without reservation.',
      standing_assertion: 'All rights reserved. UCC 1-308. Without Prejudice.',
      file: 'src/services/romanBlacksLawFraud.ts'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  },

  // ─── LAYER 0: BADGE OF SLAVERY DIAGNOSTIC ────────────────────────────────
  {
    category: 'legal_defense',
    knowledge_key: 'badge_of_slavery_diagnostic_layer0',
    value: {
      title: 'Badge of Slavery Diagnostic — 13th Amendment Constitutional Auditor',
      layer: 0,
      description: 'Runs ABOVE all statutory analysis. Detects constitutional injuries under the 13th Amendment before FDCPA, FCRA, or any consumer law is applied. Constitutional arguments supersede statutory arguments.',
      legal_foundation: [
        'U.S. Const. Amend. XIII §1 — Prohibition of Slavery and Involuntary Servitude',
        'U.S. Const. Amend. XIII §2 — Enforcement Clause',
        'Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968) — 13th Amendment reaches ALL badges and incidents of slavery',
        'Bailey v. Alabama, 219 U.S. 219 (1911) — debt bondage / peonage = involuntary servitude',
        'Timbs v. Indiana, 586 U.S. (2019) — Excessive Fines Clause incorporated against states'
      ],
      badge_indicators: [
        'Involuntary Economic Extraction — garnishment, levy, tax sale, forced sale [weight: 3]',
        'Restriction of Mobility — license suspension, travel restriction, detention [weight: 2]',
        'Disproportionate Economic Peonage — penalty-on-penalty, unpayable compound debt [weight: 3]',
        'Imposed Personhood / Forced Joinder — compulsory appearance, bench warrant [weight: 2]',
        'Discriminatory Property Denial — redlining, disparate impact, denied housing [weight: 3]',
        'Ancestral Land Extraction — tax sale, eminent domain, title challenge on ancestral land [weight: 3]',
        'Systemic Debt Bondage — zombie debt, re-aged debt, purchased debt [weight: 2]'
      ],
      severity_scale: 'LOW (1-2) → MEDIUM (3-4) → HIGH (5-7) → CRITICAL (8+)',
      amplifiers: 'isRecurring +1 | affectedLineage +2 | historicalPattern +2',
      remedy_paths: [
        '42 U.S.C. §1983 — deprivation of rights under color of law',
        '42 U.S.C. §1982 — racial discrimination in property (Jones v. Mayer)',
        'UNDRIP Article 26 — ancestral land rights',
        'McGirt v. Oklahoma (2020) — treaty/ancestral claim survives state jurisdiction assertion',
        'Timbs Excessive Fines challenge for disproportionate penalties',
        'Structural injunction + restitution + declaratory relief for CRITICAL severity'
      ],
      counter_canon_volume: 'Vol. 6 — Equity (Badge of Slavery / Mandatory Remedy)',
      file: 'src/services/romanBadgeOfSlaveryDiagnostic.ts'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  },

  // ─── LAYER 2: SOVEREIGN TOOLKIT REGISTRY ─────────────────────────────────
  {
    category: 'legal_defense',
    knowledge_key: 'sovereign_toolkit_registry_tk01_tk07',
    value: {
      title: 'Sovereign Toolkit Registry — TK-01 through TK-07',
      layer: 2,
      description: 'Seven strategic toolkits mapping real-world crisis scenarios to specific legal defense protocols. R.O.M.A.N. routes automatically based on scenario keywords.',
      toolkits: {
        'TK-01': {
          title: 'Unlawful Stop and Detention',
          triggers: ['pulled over', 'traffic stop', 'detained', 'searched', 'arrested', 'police', 'officer asked'],
          counter_canon: 'Vol_3_Enforcement',
          primary_defense: '4th Amendment — Terry v. Ohio requires reasonable articulable suspicion of a specific victim-based crime. Ask: Am I being detained or am I free to go?',
          immediate_action: 'State clearly: "Am I being detained or am I free to go?" Do not consent to search. Do not answer questions beyond identity.',
          standing: 'I am a Living Being. My vessel is not subject to seizure without Probable Cause of a specific, victim-based crime.'
        },
        'TK-02': {
          title: 'Tax and Labor Extraction',
          triggers: ['IRS', 'tax notice', 'back taxes', 'levy', 'garnishment', 'wage', 'W-2', 'tax lien', 'administrative penalty'],
          counter_canon: 'Vol_2_Transactional + Loper Bright (2024)',
          primary_defense: 'Loper Bright Enterprises v. Raimondo (2024) — Chevron deference ELIMINATED. Courts owe NO deference to agency interpretations. Demand statutory authority (not agency rule) for every penalty line item.',
          immediate_action: 'Demand itemized statutory authority for each charge. No deference to "policy" or "rule" — cite the exact statute. File Collection Due Process hearing request within 30 days of notice.',
          standing: 'Trust property is not personal income. The Living Being is not the same entity as the statutory taxpayer designation.'
        },
        'TK-03': {
          title: 'Court Jurisdiction Challenge',
          triggers: ['summons', 'lawsuit', 'court', 'judge', 'hearing', 'complaint filed', 'defendant', 'case number'],
          counter_canon: 'Vol_1_Foundational + Vol_2_Transactional',
          primary_defense: 'Jurisdiction is a fact that must be proven on the record — not presumed. Challenge jurisdiction FIRST before any substantive response.',
          immediate_action: 'File Special Appearance (not General Appearance). Reserve all rights UCC 1-308. Challenge: (1) subject matter jurisdiction, (2) personal jurisdiction, (3) standing of plaintiff.',
          standing: 'I appear specially, not generally. My appearance does not constitute consent to this court\'s jurisdiction.'
        },
        'TK-04': {
          title: 'Religious Belief and Spiritual Exemption',
          triggers: ['minister', 'church', 'religious', 'faith', 'ministry', 'spiritual', 'worship', 'ecclesiastical', 'sincerely held belief'],
          counter_canon: 'Vol_5_Spiritual',
          primary_defense: 'RFRA (42 U.S.C. §2000bb) + RLUIPA (42 U.S.C. §2000cc) — government must show compelling interest AND least restrictive means before substantially burdening religious exercise.',
          immediate_action: 'File RFRA/RLUIPA notice immediately. Document religious practice. Cite 303 Creative v. Elenis (2023) and Groff v. DeJoy (2023).',
          standing: 'This is a Healing Ministry Asset held under Ecclesiastical Standing per O.C.G.A. §53-12-200 and the Free Exercise Clause.'
        },
        'TK-05': {
          title: 'Economic Rights and Debt Collection Defense',
          triggers: ['debt collector', 'collection letter', 'credit report', 'FDCPA', 'FCRA', 'charge off', 'collections', 'medical debt', 'garnishment'],
          counter_canon: 'Vol_6_Equity + 13th Amendment',
          primary_defense: '15 U.S.C. §1692g — 30-day validation window. Request full chain of title. Cite Timbs v. Indiana for excessive fees. Run Badge of Slavery Diagnostic first.',
          immediate_action: 'Send debt validation letter via certified mail within 30 days. Demand: (1) original creditor, (2) itemized amount, (3) chain of assignment, (4) authority for each fee.',
          standing: 'All economic extractions are reviewed for 13th Amendment Badge of Slavery violations before any statutory response.'
        },
        'TK-06': {
          title: 'Housing and Property Rights',
          triggers: ['eviction', 'dispossessory', 'landlord', 'lease', 'foreclosure', 'housing', 'rent', 'notice to vacate'],
          counter_canon: 'Vol_4_Land',
          primary_defense: 'Georgia dispossessory — FILE WRITTEN ANSWER WITHIN 7 DAYS or lose by default. Fair Housing Act §3601 for discrimination. RLUIPA for religious land use.',
          immediate_action: 'File written answer in Magistrate Court within 7 calendar days. Assert ALL defenses simultaneously. Do not wait.',
          standing: 'Property held in the Howard Jones Bloodline Ancestral Trust is Trust property — not personal property subject to personal creditor claims.'
        },
        'TK-07': {
          title: 'Ancestral Land and Cultural Rights',
          triggers: ['ancestral land', 'family land', 'tax sale', 'property tax', 'eminent domain', 'Cherokee', 'Piedmont', 'Clarke County', '80 years', 'generational'],
          counter_canon: 'Vol_4_Land_Sacred + UNDRIP + McGirt',
          primary_defense: 'McGirt v. Oklahoma (2020) — state assertions of jurisdiction do not extinguish prior ancestral claims absent explicit congressional abrogation. Prior in time = prior in right.',
          immediate_action: 'File Emergency Motion to Stay any sale. Invoke RLUIPA for religious land use. File 42 U.S.C. §1983 constitutional challenge. Document ancestral chain of possession.',
          standing: 'This land predates the State\'s tax scheme. My ancestral claim is prior in time, prior in right. The State must prove its superior interest — not assert it.'
        }
      },
      routing_logic: 'R.O.M.A.N. scans scenario keywords against all 7 toolkit trigger lists. Best match activates primary toolkit. Second match activates secondary toolkit. Dual activation is common for complex scenarios.',
      file: 'src/services/romanLegalService.ts'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  },

  // ─── LAYER 4: GUILD FIREWALL ──────────────────────────────────────────────
  {
    category: 'legal_defense',
    knowledge_key: 'guild_firewall_layer4',
    value: {
      title: 'Guild Firewall — Attorney vs. Lawyer Distinction / Capacity Protection',
      layer: 4,
      description: 'Audits any representative for Divided Loyalty. Generates Notice of Divided Loyalty and Limited Scope statement. Identifies guild linguistic traps in legal communications.',
      attorney_vs_lawyer: {
        attorney: 'An Officer of the Court. Primary duty runs to the court — NOT the client. Can be sanctioned for arguments the court deems frivolous. Subject to bar discipline. ALWAYS issues Divided Loyalty Notice.',
        lawyer: 'Skilled in law but not necessarily an Officer of the Court. More favorable capacity for the Living Being.'
      },
      guild_traps: [
        'represent — implies speaking for you, replacing your voice',
        'client — reduces Living Being to a commercial party in a transaction',
        'stipulate — waiving rights without explicit authorization',
        'officer of the court — divided loyalty never disclosed',
        'waive — rights are surrendered without your knowledge',
        'consent — implied consent is not informed consent',
        'defendant — accepting this label accepts the charge',
        'plead — entering the system\'s jurisdiction',
        'power of attorney — broad authority delegation',
        'hereinafter — redefining you mid-document'
      ],
      divided_loyalty_notice: 'Auto-generated when attorney is detected. States: You are the Principal. They are the limited-scope agent. They cannot enter pleas, stipulations, or admissions without written authorization. All rights reserved UCC 1-308.',
      how_to_invoke: 'Any time an attorney contacts you on behalf of adverse party, or your own counsel is engaged, run Guild Firewall audit first.',
      file: 'src/services/romanSovereignProcessor.ts'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  },

  // ─── LAYER 5: PAPERBACK QR BRIDGE ────────────────────────────────────────
  {
    category: 'legal_defense',
    knowledge_key: 'paperback_qr_bridge_layer5',
    value: {
      title: 'Paperback QR Bridge — Active Amendment Record System',
      layer: 5,
      description: 'Links physical Sovereign Self Series books (QR codes) to live post-print case law updates. Every toolkit has a live amendment record. R.O.M.A.N. can draft a Letter of Amendment on demand.',
      purpose: 'The printed books are static. The law moves. This bridge keeps the physical books current with real-time case law through R.O.M.A.N.\'s CourtListener integration.',
      critical_post_print_updates: {
        'TK-01': 'Torres v. Madrid (2021) — mere application of physical force constitutes a 4th Amendment seizure even if pursuit fails.',
        'TK-02': 'Loper Bright v. Raimondo (2024) — CRITICAL. Chevron deference ELIMINATED. Courts must independently determine what the law means. Agency interpretations of their own penalty authority no longer get deference.',
        'TK-03': 'Mallory v. Norfolk Southern (2023) — general jurisdiction consent via state registration reaffirmed.',
        'TK-04': '303 Creative v. Elenis (2023) — government cannot compel actions violating sincerely held religious beliefs. Groff v. DeJoy (2023) — substantial burden standard strengthened.',
        'TK-05': 'CFPB v. Community Financial Services (2024) — CFPB funding structure upheld. CFPB medical debt rule (2025) — medical debt removed from credit reports.',
        'TK-06': 'Georgia dispossessory — 7-day answer requirement. File the same day you receive the summons.',
        'TK-07': 'McGirt v. Oklahoma (2020) — CRITICAL. Treaty rights survive state jurisdiction assertions absent explicit congressional abrogation. RLUIPA strict scrutiny for religious land use.'
      },
      loper_bright_application: 'For ANY government-imposed administrative penalty, fine, or fee: cite Loper Bright. The agency\'s interpretation of its own penalty authority is no longer entitled to deference. The court must independently determine if the statute actually authorized that specific penalty in that specific amount. Demand chapter and verse — not policy, not rule, not interpretation. The exact statute.',
      how_to_use: 'Scan toolkit QR code or request TK-XX amendment record. R.O.M.A.N. returns post-print case law updates and drafts a personalized Letter of Amendment for your case.',
      file: 'src/services/romanPaperbackApi.ts'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  },

  // ─── FULL ARCHITECTURE SUMMARY ────────────────────────────────────────────
  {
    category: 'legal_defense',
    knowledge_key: 'legal_defense_5layer_architecture',
    value: {
      title: 'R.O.M.A.N. Legal Defense Enhancement — 5-Layer Architecture',
      deployed_date: '2026-03-20',
      description: 'Complete integration of the Sovereign Self Legal Defense Series into R.O.M.A.N. Constitutional analysis runs first. Statutory analysis runs second. The Living Being\'s standing is established before any legal strategy is deployed.',
      layers: [
        'Layer 0a — Counter-Canon Dictionary (romanBlacksLawFraud.ts): 8 volumes, 17 terms. Linguistic standing established before anything else.',
        'Layer 0b — Badge of Slavery Diagnostic (romanBadgeOfSlaveryDiagnostic.ts): 13th Amendment constitutional auditor. 7 badge indicators. Runs above all statutory law.',
        'Layer 1  — Linguistic Deprogramming (romanDeprogrammingModule.ts): 8 programming layers + linguistic trap detection.',
        'Layer 2  — Sovereign Toolkit Router (romanLegalService.ts): 7 toolkits, keyword routing, Counter-Canon trap scan on user input.',
        'Layer 4  — Guild Firewall (romanSovereignProcessor.ts): Attorney audit, divided loyalty notice, 10 guild trap detectors.',
        'Layer 5  — Paperback QR Bridge (romanPaperbackApi.ts): Live amendment records for all 7 toolkits, Letter of Amendment drafting, CourtListener integration.'
      ],
      inversion_principle: 'Standard legal engines start with consumer protection statutes (FDCPA, FCRA). This system starts with the Constitution (13th Amendment), then treaty law (McGirt), then RFRA/RLUIPA, then federal statute. The highest authority controls.',
      dashboard: 'LegalDefenseDashboard.tsx — Guild Firewall tab, Sovereign Toolkit tab, Book Sync tab',
      books_supported: 'Sovereign Self Series Books 1-7 (TK-01 through TK-07)',
      ppa_044_connection: 'Howard Jones Body Suit (PPA_044) includes Sovereign Bio-Data Architecture (Claim 8) — UCC Article 12 Controllable Electronic Record. Trust retains Exclusive Control. This legal architecture governs all bio-data generated by the Body Suit.',
      status: 'FULLY DEPLOYED — all 5 layers active in frontend and Discord bot'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  },

  // ─── PPA_044 BODY SUIT ────────────────────────────────────────────────────
  {
    category: 'patent_portfolio',
    knowledge_key: 'PPA_044_howard_jones_body_suit',
    value: {
      title: 'Howard Jones Body Suit: Sovereign Inhabitance System',
      ppa_number: 'PPA_044',
      identifier: 'HJ-RESTORE-B8-9-10',
      filing_date: '2026-03-16',
      git_commit: 'daa34aa',
      git_timestamp: '2026-03-20',
      status: 'specification_complete_fee_pending',
      filing_fee_required: 320,
      filing_fee_status: 'deferred — no deadline pressure (new PPA, not a conversion)',
      conversion_deadline: 'none yet — file when funds available',
      inventor: 'Rickey Allan Howard',
      trust: 'Howard Jones Bloodline Ancestral Trust',
      ecclesiastical_standing: 'Healing Ministry Asset — O.C.G.A. §53-12-200 / U.S. Const. Amend. I Free Exercise Clause',
      related_ip: ['63/913134 (R.O.M.A.N. AI)', '63/991193 (K.A.I.T.S.)', 'PPA_043 (64/005,820)'],
      prior_art: 'TXu 2-529-780',
      books: 'Sovereign Self Series — Books 8, 9 & 10',
      nine_claims: [
        'Claim 1: System (broadest) — graphene hexagonal lattice, 51-node piezoelectric array, 528Hz resonance',
        'Claim 2: Innocence Protocol — growth-adaptive pediatric tensioners, 12cm elastic expansion range',
        'Claim 3: Thermal-Cardiac Sync — cardiac frequency encryption, 37°C±0.3 thermal regulation',
        'Claim 4: Neural Bridge / Spinal Bridge — direct spinal stimulation 0.5Hz–40Hz',
        'Claim 5: Hostile Frequency Lock — Passive Faraday Grounding Mode, cavitation wave deflection',
        'Claim 6: Self-Powering Kinetic Engine — 51 piezoelectric micro-nodes, 100mW continuous',
        'Claim 7: Sanctuary Uplink — HBC (Human Body Communication) data transmission',
        'Claim 8: Sovereign Bio-Data Architecture — UCC Article 12 CER, Trust Exclusive Control',
        'Claim 9: Method claim — method of operating the wearable system'
      ],
      key_technical: 'Graphene hexagonal lattice (<1mm), 528Hz resonance, cardiac frequency encryption, neural tunneling, Passive Faraday Grounding Mode, Human Body Communication (HBC)',
      protection_status: 'Conception date locked in git history. Copyright TXu 2-529-780 provides prior art shield. No one can file this invention before us.',
      priority_vs_ppa043: 'SECONDARY. PPA_043 conversion (March 14, 2027) is the critical deadline. PPA_044 fee is deferred.',
      file: 'legal/PPA_044_HOWARD_JONES_BODY_SUIT_SOVEREIGN_INHABITANCE_SYSTEM.md'
    },
    learned_from: 'legal_defense_5layer_brief_march20_2026',
    updated_at: today
  }

];

async function briefRoman() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  R.O.M.A.N. Knowledge Brief — 5-Layer Legal Defense  ║');
  console.log('║  March 20, 2026                                       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  for (const entry of knowledge) {
    const { data: existing } = await supabase
      .from('system_knowledge')
      .select('id')
      .eq('knowledge_key', entry.knowledge_key)
      .maybeSingle();

    let error;

    if (existing) {
      ({ error } = await supabase
        .from('system_knowledge')
        .update({
          category: entry.category,
          value: entry.value,
          learned_from: entry.learned_from,
          updated_at: entry.updated_at
        })
        .eq('knowledge_key', entry.knowledge_key));
    } else {
      ({ error } = await supabase
        .from('system_knowledge')
        .insert({
          category: entry.category,
          knowledge_key: entry.knowledge_key,
          value: entry.value,
          learned_from: entry.learned_from,
          updated_at: entry.updated_at
        }));
    }

    if (error) {
      console.error(`❌ Failed: ${entry.knowledge_key}\n   ${error.message}`);
    } else {
      const layer = entry.value.layer !== undefined ? ` [Layer ${entry.value.layer}]` : '';
      console.log(`✅ ${existing ? 'Updated' : 'Inserted'}: ${entry.knowledge_key}${layer}`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('R.O.M.A.N. is now briefed on all 5 layers.');
  console.log('Discord bot will respond with full legal defense architecture.');
  console.log('════════════════════════════════════════════════════════\n');
}

briefRoman();
