import https from 'https';
import fs from 'fs';

const token = fs.readFileSync(process.env.TEMP + '/sb_token.txt', 'utf8').trim();
const projectId = 'tvsxloejfsrdganemsmg';

async function run(sql, label) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const ok = !data.toLowerCase().includes('"error"') && !data.toLowerCase().includes('error:');
        console.log(ok ? `✅ ${label}` : `❌ ${label}: ${data.slice(0, 300)}`);
        resolve(ok);
      });
    });
    req.on('error', e => { console.error(label, e.message); resolve(false); });
    req.write(body);
    req.end();
  });
}

// ─── Volume 2: Debt Collection Defense ────────────────────────────────────────
const vol2 = [
  {
    volume_number: 2, key_name: 'debt_validation_letter',
    topic: 'How to Write a Debt Validation Letter',
    content: {
      summary: 'Under 15 U.S.C. 1692g, you have 30 days from first contact to demand written verification of any debt. The collector must stop all collection activity until they provide it. Your letter creates a legal paper trail.',
      steps: [
        'Write a letter stating: "I dispute this debt and demand full written verification per 15 U.S.C. 1692g"',
        'Request: original creditor name, account number, itemized balance breakdown, proof of right to collect',
        'Send via USPS Certified Mail with Return Receipt — keep the green card',
        'Note the date sent — collector must respond before resuming collection',
        'If they continue collecting without verifying — each contact is a separate FDCPA violation'
      ],
      key_statute: '15 U.S.C. 1692g', deadline_days: 30
    }
  },
  {
    volume_number: 2, key_name: 'fdcpa_cease_desist',
    topic: 'How to Stop All Debt Collector Contact Forever',
    content: {
      summary: 'Under 15 U.S.C. 1692c(c), a written cease and desist letter legally prohibits the collector from contacting you again — except to confirm they will stop or to notify you of a lawsuit.',
      steps: [
        'Write: "Pursuant to 15 U.S.C. 1692c(c), you are hereby directed to cease all communication with me regarding this alleged debt"',
        'Send via Certified Mail Return Receipt',
        'After receipt, collector may only contact you ONE final time',
        'Any additional contact after that is a federal violation — $1,000 statutory damages per violation',
        'Document: date, time, method of each contact after your letter'
      ],
      key_statute: '15 U.S.C. 1692c(c)', remedy: 'Each violation after cease and desist = $1,000 statutory damages + actual damages + attorney fees (15 U.S.C. 1692k)'
    }
  },
  {
    volume_number: 2, key_name: 'debt_collection_harassment',
    topic: 'Recognizing Illegal Debt Collector Harassment',
    content: {
      summary: 'The FDCPA bans specific collector behaviors. Each violation is independently actionable — meaning you can sue for each incident. Many FCRA/FDCPA attorneys take these cases on contingency.',
      prohibited: [
        'Calling before 8 AM or after 9 PM local time',
        'Calling your employer after being told it is inconvenient',
        'Using profane or abusive language',
        'Threatening arrest or criminal prosecution for civil debt',
        'Misrepresenting the amount owed or their identity',
        'Threatening legal action they cannot or do not intend to take',
        'Publishing your name on a "bad debtor" list',
        'Contacting third parties about your debt (except to locate you)'
      ],
      remedy: 'Up to $1,000 statutory damages per lawsuit + actual damages + attorney fees. 1-year statute of limitations to sue.',
      key_statute: '15 U.S.C. 1692d, 1692e, 1692f'
    }
  },
  {
    volume_number: 2, key_name: 'debt_buyer_chain_of_title',
    topic: 'Debt Buyers Must Prove They Own Your Debt',
    content: {
      summary: 'When a debt is sold, the new "debt buyer" must prove they own it and have the legal right to collect. Many cannot produce the original agreement, assignment chain, or accurate balance — making the debt legally unenforceable.',
      steps: [
        'Request the full chain of assignment — every entity that has owned this debt',
        'Request a copy of the original signed credit agreement',
        'Request an itemized accounting of every charge added to the balance',
        'If they cannot produce these documents, the debt may be unenforceable',
        'If they sue without this proof, you can move to dismiss for lack of standing'
      ],
      key_statute: '15 U.S.C. 1692g(b)', deadline_days: 30
    }
  },
  {
    volume_number: 2, key_name: 'dispossessory_answer',
    topic: 'Filing a Written Answer to a Georgia Dispossessory',
    content: {
      summary: 'When served with a Georgia eviction (dispossessory) summons, you have exactly 7 calendar days to file a written answer. Silence = automatic default judgment. Your answer preserves your right to be heard.',
      steps: [
        'File your written answer at the Magistrate Court within 7 calendar days of service',
        'Assert ALL defenses in your answer — you waive what you do not raise',
        'Valid defenses: improper notice, landlord breach of habitability, retaliation, discrimination, acceptance of partial rent',
        'If you want to stay: pay undisputed rent into the court registry',
        'Request a jury trial in your answer if you want one'
      ],
      key_statute: 'O.C.G.A. 44-7-56', deadline_days: 7
    }
  },
  {
    volume_number: 2, key_name: 'sol_affirmative_defense',
    topic: 'Using Statute of Limitations as a Defense Against Old Debts',
    content: {
      summary: 'Georgia has a 6-year statute of limitations on written contracts (O.C.G.A. 9-3-24). Once this period expires, collectors cannot sue to collect. If they do sue, you must raise it as an affirmative defense or you waive it.',
      steps: [
        'Determine the date of your last activity on the account (last payment or first missed payment)',
        'Georgia: 6 years for written contracts, 4 years for oral contracts',
        'If the debt is time-barred, do NOT make any payment — even $1 can restart the clock in some jurisdictions',
        'If sued on a time-barred debt, file your answer and raise SOL as an affirmative defense',
        'Filing deadline for your answer: typically 30 days in Superior Court, 7 days in Magistrate Court'
      ],
      key_statute: 'O.C.G.A. 9-3-24'
    }
  }
];

// ─── Volume 3: Credit Report Mastery ──────────────────────────────────────────
const vol3 = [
  {
    volume_number: 3, key_name: 'how_to_pull_credit_reports',
    topic: 'How to Get Your Free Credit Reports',
    content: {
      summary: 'Under 15 U.S.C. 1681j, you are entitled to one free credit report per year from each bureau (Equifax, Experian, TransUnion) through AnnualCreditReport.com. Since 2023, free weekly reports are available.',
      steps: [
        'Go to AnnualCreditReport.com — the only federally mandated free source',
        'Request all three bureaus at once or stagger them every 4 months',
        'Print or save a PDF of each report immediately',
        'Review every account, balance, payment history, and inquiry',
        'Flag every item you do not recognize or that is inaccurate'
      ],
      key_statute: '15 U.S.C. 1681j'
    }
  },
  {
    volume_number: 3, key_name: 'credit_dispute_letter',
    topic: 'How to Write a Credit Bureau Dispute Letter That Works',
    content: {
      summary: 'Under 15 U.S.C. 1681i, bureaus must investigate disputes within 30 days and delete any information that cannot be verified. The key is specificity — vague disputes fail; targeted disputes with evidence win.',
      steps: [
        'State the exact item: creditor name, account number, and what is inaccurate',
        'State WHY it is inaccurate: "This account was paid in full on [date]" or "This is not my account"',
        'Attach supporting documentation (settlement letter, payment confirmation, FTC identity theft report)',
        'Cite the statute: "Pursuant to 15 U.S.C. 1681i, I demand a reinvestigation..."',
        'Send to all three bureaus via Certified Mail Return Receipt',
        'If unverified within 30 days — it must be deleted'
      ],
      key_statute: '15 U.S.C. 1681i', deadline_days: 30
    }
  },
  {
    volume_number: 3, key_name: 'credit_reporting_periods',
    topic: 'Exactly How Long Negative Items Stay on Your Credit Report',
    content: {
      summary: 'Under 15 U.S.C. 1681c, most negative information must be removed after 7 years from the date of first delinquency. The reporting clock starts when you first missed a payment — not when the account was charged off, sold, or sent to collections.',
      items: {
        'Late payments (30/60/90 days)': '7 years from first delinquency',
        'Charge-offs': '7 years from date of original delinquency',
        'Collections accounts': '7 years from original delinquency (NOT collection date)',
        'Chapter 7 bankruptcy': '10 years from filing date',
        'Chapter 13 bankruptcy': '7 years from filing date',
        'Hard inquiries': '2 years from date of inquiry',
        'Medical debt under $500': 'Cannot be reported (CFPB rule effective 2025)',
        'Paid tax liens': 'Must be removed (IRS Fresh Start program)'
      },
      key_statute: '15 U.S.C. 1681c'
    }
  },
  {
    volume_number: 3, key_name: 'cfpb_complaint_strategy',
    topic: 'Using CFPB Complaints as a Legal Enforcement Tool',
    content: {
      summary: 'Filing a CFPB complaint creates a federal record, forces the company to respond within 15 days, and can trigger regulatory examination. It is free, fast, and companies take it seriously because patterns of complaints invite enforcement action.',
      steps: [
        'Go to consumerfinance.gov/complaint',
        'Select the specific product (credit reporting, debt collection, mortgage, etc.)',
        'Be specific and factual — describe what happened, when, and who was involved',
        'Attach supporting documentation (letters, account statements, recordings)',
        'You receive a tracking number — the company must respond within 15 days',
        'If the response is inadequate, escalate through the CFPB portal',
        'Parallel file with your state attorney general for added pressure'
      ],
      key_statute: '12 U.S.C. 5493'
    }
  },
  {
    volume_number: 3, key_name: 'identity_theft_credit_freeze',
    topic: 'How to Freeze Your Credit and Remove Fraudulent Accounts',
    content: {
      summary: 'Under 15 U.S.C. 1681c-2, if you are a victim of identity theft, bureaus must block fraudulent information within 4 business days of receiving your request. A credit freeze is free and prevents new accounts from being opened.',
      steps: [
        'File an identity theft report at IdentityTheft.gov — creates your FTC Identity Theft Report',
        'Freeze your credit at all three bureaus: equifax.com, experian.com, transunion.com (free by law)',
        'Send a blocking request to each bureau: attach your FTC report and identify every fraudulent item',
        'Bureaus must block fraudulent info within 4 business days',
        'Contact each creditor directly and dispute all fraudulent accounts',
        'Request free fraud alerts — bureaus must notify you before opening new credit'
      ],
      key_statute: '15 U.S.C. 1681c-2', deadline_days: 4
    }
  }
];

// ─── Volume 4: Contract Law Basics ────────────────────────────────────────────
const vol4 = [
  {
    volume_number: 4, key_name: 'elements_of_valid_contract',
    topic: 'What Makes a Contract Legally Binding',
    content: {
      summary: 'A contract is only enforceable if it contains four elements: offer, acceptance, consideration, and mutual assent (meeting of the minds). Missing any one element makes the contract void or voidable.',
      steps: [
        'Offer: One party proposes specific terms',
        'Acceptance: The other party agrees to those exact terms without modification',
        'Consideration: Both sides give something of value (money, services, promise)',
        'Capacity: Both parties must be 18+ and of sound mind',
        'Legality: The subject matter cannot be illegal'
      ],
      key_statute: 'O.C.G.A. 13-3-1 (Georgia Contract Law)'
    }
  },
  {
    volume_number: 4, key_name: 'breach_of_contract',
    topic: 'What Is a Breach of Contract and What Are Your Remedies',
    content: {
      summary: 'A breach occurs when one party fails to perform their contractual obligations without legal excuse. You are entitled to be put in the position you would have been in had the contract been performed.',
      steps: [
        'Document the exact terms of the contract',
        'Document how the other party failed to perform (breach)',
        'Send written notice of the breach — give them opportunity to cure',
        'If uncured: file in the appropriate court (Magistrate for small claims up to $15,000)',
        'Damages: expectation damages (what you lost), consequential damages (reasonably foreseeable losses), specific performance (courts can order performance for unique goods or property)'
      ],
      key_statute: 'O.C.G.A. 13-6-1', remedy: 'Expectation damages putting you in the position you would have been in had the contract been performed'
    }
  },
  {
    volume_number: 4, key_name: 'contract_rescission_rights',
    topic: 'When You Can Cancel a Contract After Signing',
    content: {
      summary: 'Federal and state law gives you the right to rescind (cancel) certain contracts within a specific window. This is not a right that applies to all contracts — it is limited to specific consumer transactions.',
      steps: [
        'Home solicitation sales (O.C.G.A. 10-1-6): 3 business days to cancel contracts signed at your home',
        'Home equity/mortgage refinancing (TILA): 3 business days to rescind',
        'TILA violations in original disclosure: up to 3 years to rescind',
        'Gym memberships (Georgia): 3 business days',
        'Cancellation must be in writing, sent certified mail'
      ],
      key_statute: '15 U.S.C. 1635 (federal); O.C.G.A. 10-1-6 (Georgia)', deadline_days: 3
    }
  },
  {
    volume_number: 4, key_name: 'arbitration_clause_rights',
    topic: 'Forced Arbitration Clauses — What They Take From You',
    content: {
      summary: 'Most consumer contracts today contain mandatory arbitration clauses that waive your right to sue in court and join class actions. Courts generally enforce these, but knowing what they mean lets you negotiate or avoid them.',
      steps: [
        'Read every contract before signing — look for "arbitration," "dispute resolution," or "waiver of jury trial"',
        'Some arbitration clauses allow you to opt out within 30 days of signing — look for and use this option',
        'Small claims court: most arbitration clauses explicitly exclude small claims court — you can still use it',
        'CFPB complaints and state AG complaints are NOT affected by arbitration clauses',
        'Unconscionable arbitration terms can be challenged — consult an attorney if the clause is one-sided'
      ],
      key_statute: 'Federal Arbitration Act (9 U.S.C. 1)'
    }
  },
  {
    volume_number: 4, key_name: 'promissory_note_rights',
    topic: 'Understanding Promissory Notes and Your Payment Obligations',
    content: {
      summary: 'A promissory note is a written promise to pay a specific amount under specific terms. It is a negotiable instrument — it can be sold. If your note was sold, the new holder must still honor all original terms and defenses.',
      steps: [
        'Read the note completely — interest rate, default provisions, acceleration clause',
        'Acceleration clause: lets the lender demand the entire balance if you miss payments — understand this',
        'Holder in due course: if the note was sold, the new holder can collect but cannot escape your defenses',
        'If you dispute a note: send written notice demanding they prove they hold the original',
        'UCC Article 3 governs negotiable instruments in all states'
      ],
      key_statute: 'UCC Article 3, O.C.G.A. 11-3-101'
    }
  }
];

// ─── Volume 5: Tenant and Housing Rights ──────────────────────────────────────
const vol5 = [
  {
    volume_number: 5, key_name: 'landlord_habitability_duty',
    topic: 'Your Landlord Must Maintain a Habitable Property',
    content: {
      summary: 'Georgia law (O.C.G.A. 44-7-13) requires landlords to maintain rental property in a habitable condition — working heat, plumbing, safe structure, no pest infestation. Failure to maintain allows tenants specific remedies.',
      steps: [
        'Document every defect with photos, videos, and dates',
        'Send written notice to the landlord by certified mail — this starts the repair clock',
        'If landlord fails to repair within a reasonable time: you may have grounds to terminate the lease',
        'In some cases: you can repair and deduct the cost from rent (consult an attorney first)',
        'Never withhold rent without legal advice — it can trigger eviction even if you are right about the defect'
      ],
      key_statute: 'O.C.G.A. 44-7-13'
    }
  },
  {
    volume_number: 5, key_name: 'security_deposit_rights',
    topic: 'Georgia Security Deposit Law — What Landlords Must Do',
    content: {
      summary: 'Under O.C.G.A. 44-7-33, Georgia landlords must return your security deposit (less valid deductions) with a written itemized statement within 30 days of move-out. Failure to comply allows you to sue for double the deposit.',
      steps: [
        'Document the property condition with photos at move-in AND move-out',
        'Provide your forwarding address in writing when you move out',
        'Landlord has 30 days to return deposit or send itemized deduction list',
        'Deductions must be for actual damages beyond normal wear-and-tear',
        'If landlord fails to comply: sue in Magistrate Court for up to double the deposit amount'
      ],
      key_statute: 'O.C.G.A. 44-7-33', deadline_days: 30, remedy: 'Double the security deposit if landlord fails to return it properly within 30 days'
    }
  },
  {
    volume_number: 5, key_name: 'eviction_notice_requirements',
    topic: 'Required Notice Before a Georgia Eviction',
    content: {
      summary: 'Before filing a dispossessory, Georgia landlords must give proper written notice. Month-to-month tenants must receive 60 days notice. Non-payment of rent requires a demand for possession. Improper notice is a complete defense to eviction.',
      steps: [
        'Non-payment of rent: landlord must make a demand for possession (oral or written) before filing',
        'Month-to-month lease: 60 days written notice to terminate',
        'Fixed-term lease: no notice required at end of term unless lease says otherwise',
        'If evicted for retaliation (reporting code violations, joining a tenant union): this is an affirmative defense',
        'Federal Section 8 / HUD: additional notice requirements apply — at least 30 days for most violations'
      ],
      key_statute: 'O.C.G.A. 44-7-7, 44-7-50'
    }
  },
  {
    volume_number: 5, key_name: 'section_8_tenant_rights',
    topic: 'Section 8 / HCV Tenant Protections',
    content: {
      summary: 'If you have a Housing Choice Voucher (Section 8), federal regulations give you rights beyond Georgia state law. Landlords cannot discriminate based on source of income in many jurisdictions, and HUD has specific grievance procedures.',
      steps: [
        'Landlords must pass HUD habitability inspections before you can move in',
        'Landlord cannot raise your portion of rent without HUD approval',
        'Eviction: landlord must notify both you AND your Housing Authority simultaneously',
        'You have 30 days to respond to any termination of tenancy notice',
        'If landlord terminates for cause: file a written grievance with your local Housing Authority within 14 days'
      ],
      key_statute: '24 CFR Part 982', deadline_days: 14
    }
  },
  {
    volume_number: 5, key_name: 'fair_housing_act_rights',
    topic: 'Fair Housing Act — Discrimination in Housing Is Illegal',
    content: {
      summary: 'The Fair Housing Act (42 U.S.C. 3604) prohibits housing discrimination based on race, color, national origin, religion, sex, disability, and familial status. This applies to renting, buying, and mortgage lending.',
      prohibited: [
        'Refusing to rent or sell based on protected class',
        'Charging different terms, conditions, or fees based on protected class',
        'Advertising that discriminates ("no children," "English speakers only")',
        'Refusing reasonable accommodations for disability',
        'Steering — showing different properties based on race or national origin'
      ],
      steps: [
        'Document the discrimination: dates, what was said, who was present',
        'File a complaint with HUD: hud.gov/fairhousing (within 1 year)',
        'File with your state human rights commission',
        'You may also sue directly in federal court within 2 years'
      ],
      key_statute: '42 U.S.C. 3604', deadline_days: 365
    }
  }
];

// ─── Volume 6: Small Claims and Court Procedures ───────────────────────────────
const vol6 = [
  {
    volume_number: 6, key_name: 'small_claims_filing',
    topic: 'How to File in Georgia Magistrate (Small Claims) Court',
    content: {
      summary: 'Georgia Magistrate Court handles civil claims up to $15,000. You can sue without an attorney. Filing fees are approximately $50-75. This is the most accessible path to justice for consumer disputes.',
      steps: [
        'Go to your county Magistrate Court clerk — bring the defendant\'s name, address, and description of the claim',
        'Complete the claim form — state the amount owed and why you are owed it',
        'Pay the filing fee (~$50-75, varies by county)',
        'The court will serve the defendant with a summons',
        'Prepare your evidence: contracts, letters, receipts, photos, account statements',
        'Organize your argument: (1) what the agreement was, (2) how they breached it, (3) your damages'
      ],
      key_statute: 'O.C.G.A. 15-10-2'
    }
  },
  {
    volume_number: 6, key_name: 'court_evidence_preparation',
    topic: 'How to Prepare Evidence for Your Court Case',
    content: {
      summary: 'Evidence wins cases. The judge will rule based on what you can prove, not what you know happened. Documents, photos, records, and witness testimony are your tools.',
      steps: [
        'Organize documents in chronological order — create a timeline of events',
        'Make 3 copies: one for the judge, one for the other party, one for yourself',
        'Highlight the key passages in every document',
        'If witnesses will testify: prepare them with the specific facts they observed',
        'Text messages and emails: print them with timestamps visible',
        'Bank records: highlight the specific transactions at issue',
        'For each document: know what it proves and be ready to explain it simply'
      ],
      key_statute: 'Georgia Rules of Evidence (O.C.G.A. 24-1-1)'
    }
  },
  {
    volume_number: 6, key_name: 'default_judgment',
    topic: 'How to Get a Default Judgment When the Other Side Does Not Show',
    content: {
      summary: 'If the defendant fails to appear or respond, you are entitled to a default judgment. This gives you a court order to collect. A judgment is not automatic — you must request it properly.',
      steps: [
        'If defendant does not file an answer: file a Motion for Default with the clerk',
        'Attend your hearing — bring all evidence even if they do not show',
        'Judge will enter a default judgment in your favor if you prove your case',
        'Once you have a judgment: you can garnish wages or bank accounts in Georgia',
        'File a Writ of Fieri Facias (Fi.Fa.) to begin collection — valid for 7 years, renewable'
      ],
      key_statute: 'O.C.G.A. 9-11-55'
    }
  },
  {
    volume_number: 6, key_name: 'wage_garnishment_judgment',
    topic: 'How to Collect a Court Judgment — Wage and Bank Garnishment',
    content: {
      summary: 'A judgment is only as good as your ability to collect it. Georgia law allows you to garnish wages (up to 25% of disposable income) and bank accounts once you have a judgment recorded as a lien.',
      steps: [
        'Record your judgment in the county where the defendant lives or owns property',
        'Issue a garnishment summons to the defendant\'s employer or bank',
        'Georgia wage garnishment: maximum 25% of disposable earnings per paycheck',
        'Bank garnishment: entire account balance up to the judgment amount can be seized',
        'Defendant can claim exemptions — homestead, certain retirement accounts, public benefits',
        'Judgment lien: attaches to real property — forces disclosure if they sell'
      ],
      key_statute: 'O.C.G.A. 18-4-20'
    }
  },
  {
    volume_number: 6, key_name: 'responding_to_lawsuit',
    topic: 'How to Respond When You Are Sued',
    content: {
      summary: 'When you are served with a lawsuit, the clock starts immediately. Failing to respond results in a default judgment against you. Georgia gives you 30 days to file a written answer in most courts.',
      steps: [
        'Count your days from the date you were served — 30 days in Superior/State Court, 7 days in Magistrate Court',
        'File a written Answer with the court denying the claims you dispute',
        'Raise ALL affirmative defenses in your Answer: statute of limitations, improper service, wrong party, payment',
        'File a Counterclaim if you have one — this is your opportunity to sue them back',
        'Never ignore a lawsuit — silence = judgment against you',
        'If you cannot afford an attorney: Georgia Legal Aid (georgialegalaid.org) provides free help'
      ],
      key_statute: 'O.C.G.A. 9-11-12', deadline_days: 30
    }
  }
];

const allEntries = [...vol2, ...vol3, ...vol4, ...vol5, ...vol6];

console.log(`Seeding ${allEntries.length} entries for Volumes 2-6...\n`);

let successCount = 0;
for (const e of allEntries) {
  const contentStr = JSON.stringify(e.content).replace(/'/g, "''");
  const topicStr = e.topic.replace(/'/g, "''");
  const ok = await run(
    `INSERT INTO public.layman_law_knowledge (volume_number, topic, key_name, content)
     VALUES (${e.volume_number}, '${topicStr}', '${e.key_name}', '${contentStr}')
     ON CONFLICT (key_name) DO NOTHING;`,
    `Vol${e.volume_number}: ${e.key_name}`
  );
  if (ok) successCount++;
}

console.log(`\n✅ Seeded ${successCount}/${allEntries.length} entries.`);
console.log('Volumes 2-6 now have content in layman_law_knowledge.');
