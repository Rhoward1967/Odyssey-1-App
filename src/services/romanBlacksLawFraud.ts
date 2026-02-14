/**
 * R.O.M.A.N. Black's Law Dictionary Fraud Analysis
 *
 * "If I'm wrong, they gonna have to prove me wrong.
 *  I'm only looking at their own laws, and what I see is fraud
 *  as defined in Black's Law."
 * - Rickey Allan Howard
 *
 * This module maps detected fraud patterns to Black's Law Dictionary
 * definitions, proving that each fraud meets the LEGAL DEFINITION of fraud
 * using the system's own authoritative legal dictionary.
 *
 * Methodology:
 * 1. Use THEIR statutes (26 USC, 12 USC, 15 USC)
 * 2. Use THEIR definitions (Black's Law Dictionary)
 * 3. Show their conduct meets THEIR definition of fraud
 * 4. Burden shifts to THEM to prove it's not fraud
 */

import type { FraudPattern } from './romanAdvancedFraudDetection';

// ═══════════════════════════════════════════════════════════════════════════
// BLACK'S LAW DICTIONARY DEFINITIONS (11th Edition)
// ═══════════════════════════════════════════════════════════════════════════

export interface BlacksLawFraudDefinition {
  term: string;
  blacksDefinition: string; // Exact text from Black's Law Dictionary
  edition: string;
  page?: string;
  elementsRequired: string[]; // What must be proven for this fraud
  conductThatMeetsDefinition: string; // How their conduct matches definition
  proofRequired: string; // What they must produce to prove it's NOT fraud
}

export interface BlacksLawFraudMapping {
  fraudType: string;
  blacksLawTerms: BlacksLawFraudDefinition[];
  statutoryBasis: string[];
  proofOfFraud: string;
  theirBurdenToDisprove: string;
}

class RomanBlacksLawFraud {

  /**
   * BLACK'S LAW DEFINITION: FRAUD
   *
   * Master definition that applies to most patterns
   */
  private getBlacksFraudDefinition(): BlacksLawFraudDefinition {
    return {
      term: "FRAUD",
      blacksDefinition: `A knowing misrepresentation or knowing concealment of a material fact made to induce another to act to his or her detriment. • Fraud is usu. a tort, but in some cases (esp. when the conduct is willful) it may be a crime.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "793",
      elementsRequired: [
        "1. Misrepresentation or concealment",
        "2. Of a material fact",
        "3. Made knowingly (scienter)",
        "4. With intent to induce reliance",
        "5. Actual reliance by victim",
        "6. Resulting in detriment/damages"
      ],
      conductThatMeetsDefinition: `Banks/creditors knowingly conceal material facts about debt transactions (creation of money from signature, hidden accounts, tax benefits received, sale of debt) to induce debtors to believe they owe money, causing detriment when debtors pay money they don't actually owe.`,
      proofRequired: `To prove this is NOT fraud, they must show: (1) No misrepresentation or concealment occurred, (2) Facts concealed were not material, (3) They did not know facts were concealed, (4) They did not intend debtor to rely, (5) Debtor did not actually rely, (6) Debtor suffered no detriment.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: FRAUD IN THE FACTUM
   *
   * Applies to systemic insolvency (entire basis of transaction is fraudulent)
   */
  private getBlacksFraudInFactum(): BlacksLawFraudDefinition {
    return {
      term: "FRAUD IN THE FACTUM",
      blacksDefinition: `Fraud occurring when a legal instrument as actually executed differs from the one intended for execution by the person who executes it, or when the instrument may have had no legal existence. • Compared with fraud in the inducement, fraud in the factum occurs only rarely, as when a blind person signs a mortgage when misleadingly told that the document is just a letter.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "794",
      elementsRequired: [
        "1. Executed instrument differs from what was represented",
        "2. Or instrument has no legal existence/validity",
        "3. Party misled about nature of transaction"
      ],
      conductThatMeetsDefinition: `Bank represented transaction as "loan" of "money," but actually: (1) Bank had no money to lend (only FRN debt instruments from insolvent Fed), (2) Bank created account entry from debtor's signature (not a loan), (3) Promissory note has no legal basis because bank gave no consideration (contract void for lack of consideration). The instrument signed (promissory note) was represented as evidence of a "loan" but the loan never legally existed.`,
      proofRequired: `To prove this is NOT fraud in the factum, bank must show: (1) They actually had money to lend (not debt instruments), (2) They transferred value to debtor (not just created entries), (3) Valid consideration supported the contract, (4) Transaction was actually what they represented it to be (a loan of money).`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: CONVERSION
   *
   * Applies to collection on sold debt, hidden accounts
   */
  private getBlacksConversion(): BlacksLawFraudDefinition {
    return {
      term: "CONVERSION",
      blacksDefinition: `The wrongful possession or disposition of another's property as if it were one's own; an act or series of acts of willful interference, without lawful justification, with an item of property in a manner inconsistent with another's right, whereby that other person is deprived of the use and possession of the property.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "415",
      elementsRequired: [
        "1. Wrongful possession or disposition of property",
        "2. Property belongs to another",
        "3. Interference is willful and without justification",
        "4. Manner inconsistent with rightful owner's rights",
        "5. Owner deprived of use and possession"
      ],
      conductThatMeetsDefinition: `Bank sold debt to third party (transferring ownership), but continued collecting payments from debtor. Payments made after sale belong to the buyer (new owner), not bank. Bank's continued collection is wrongful disposition of buyer's property. Bank knew debt was sold but continued collecting anyway (willful interference).`,
      proofRequired: `To prove this is NOT conversion, bank must show: (1) They did not sell the debt, OR (2) They had authorization from buyer to collect on buyer's behalf, OR (3) They forwarded all collected payments to buyer, OR (4) Debtor was properly notified of sale and chose to pay bank anyway.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: UNJUST ENRICHMENT
   *
   * Applies to source of funds fraud, double recovery
   */
  private getBlacksUnjustEnrichment(): BlacksLawFraudDefinition {
    return {
      term: "UNJUST ENRICHMENT",
      blacksDefinition: `The retention of a benefit conferred by another, without offering compensation, in circumstances where compensation is reasonably expected. • A person who has been unjustly enriched at the expense of another must make restitution to the other.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1858",
      elementsRequired: [
        "1. Benefit conferred on defendant",
        "2. Defendant retained the benefit",
        "3. Without offering compensation",
        "4. In circumstances where compensation is reasonably expected",
        "5. Retention is unjust"
      ],
      conductThatMeetsDefinition: `Debtor provided promissory note (benefit worth $X to bank). Bank retained note as asset on balance sheet. Bank gave no compensation (only created ledger entries from debtor's own signature = no value transferred). Bank claims debtor still owes money despite bank receiving $X value from note. Bank's retention of debtor's value without providing real compensation is unjust enrichment.`,
      proofRequired: `To prove this is NOT unjust enrichment, bank must show: (1) Bank gave value/compensation for the promissory note, (2) Bank's "loan" was real money (not just created from debtor's signature), (3) Bank did not retain debtor's note as an asset, (4) Retention of benefit is just/equitable.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: TAX EVASION
   *
   * Applies to tax fraud pattern
   */
  private getBlacksTaxEvasion(): BlacksLawFraudDefinition {
    return {
      term: "TAX EVASION",
      blacksDefinition: `The willful attempt to defeat or evade the assessment of a tax. • Tax evasion is punishable by fine and imprisonment.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1752",
      elementsRequired: [
        "1. Willful attempt to defeat or evade tax",
        "2. Assessment of tax is avoided",
        "3. Conduct is intentional (not negligence)"
      ],
      conductThatMeetsDefinition: `Bank claimed bad debt deduction under 26 USC § 166 (tax benefit/avoided tax). Bank then sold debt for profit. Under 26 USC § 111 (Tax Benefit Rule), bank MUST report sale proceeds as income. Bank willfully failed to report sale as income (evading tax on profit from sale). Bank received double benefit: (1) deduction when claiming loss, (2) profit from sale without reporting income.`,
      proofRequired: `To prove this is NOT tax evasion, bank must show: (1) They did not claim bad debt deduction, OR (2) They properly reported sale proceeds as income per 26 USC § 111, OR (3) Failure to report was not willful (but burden is high for corporations with tax departments).`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: CONCEALMENT
   *
   * Applies to hidden account fraud, lack of notice
   */
  private getBlacksConcealment(): BlacksLawFraudDefinition {
    return {
      term: "CONCEALMENT",
      blacksDefinition: `The act of refraining from disclosure; esp., an act by which one prevents or hinders the discovery of something; a cover-up. • Active concealment is a form of fraud.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "356",
      elementsRequired: [
        "1. Duty to disclose exists",
        "2. Party refrains from disclosure",
        "3. Act prevents discovery of material fact",
        "4. Active concealment = fraud"
      ],
      conductThatMeetsDefinition: `Bank has duty to disclose under Truth in Lending Act (15 USC § 1601). Bank created TWO accounts from one signature: (1) Disclosed liability account (your "loan"), (2) Hidden asset account (bank's asset from your promissory note). Bank actively concealed asset account. Bank prevented debtor from discovering that bank profited from note. Active concealment of material fact = fraud.`,
      proofRequired: `To prove this is NOT concealment, bank must show: (1) No duty to disclose existed (contradicts 15 USC § 1601), OR (2) They disclosed both accounts to debtor, OR (3) Asset account does not exist/was not created.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: STANDING
   *
   * Critical for systemic insolvency argument
   */
  private getBlacksStanding(): BlacksLawFraudDefinition {
    return {
      term: "STANDING",
      blacksDefinition: `A party's right to make a legal claim or seek judicial enforcement of a duty or right. • To have standing in federal court, a plaintiff must show (1) that the challenged conduct has caused the plaintiff actual injury, and (2) that the interest sought to be protected is within the zone of interests meant to be regulated by the statutory or constitutional guarantee in question.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1665",
      elementsRequired: [
        "1. Actual injury to plaintiff",
        "2. Injury caused by defendant's conduct",
        "3. Interest within zone of protection"
      ],
      conductThatMeetsDefinition: `Bank claims injury (unpaid debt). But bank: (1) Operates within insolvent system (no real money), (2) Gave no value (created entries from debtor's signature), (3) Retained debtor's promissory note as asset (no loss occurred), (4) Already received tax benefit from claimed loss. Bank suffered NO ACTUAL INJURY. Bank lacks standing.`,
      proofRequired: `To prove bank HAS standing, bank must show: (1) Bank suffered actual injury/loss, (2) Bank had real money that was lent and not repaid, (3) Bank's asset (promissory note) has no value offsetting claimed loss, (4) Bank's tax benefit does not satisfy the debt.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: PRIVITY
   *
   * Applies to debt buyer fraud
   */
  private getBlacksPrivity(): BlacksLawFraudDefinition {
    return {
      term: "PRIVITY",
      blacksDefinition: `The connection or relationship between two parties, each having a legally recognized interest in the same subject matter (such as a transaction, proceeding, or piece of property); mutuality of interest.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1429",
      elementsRequired: [
        "1. Connection or relationship between parties",
        "2. Both have legally recognized interest",
        "3. In the same subject matter",
        "4. Mutuality of interest exists"
      ],
      conductThatMeetsDefinition: `Debt buyer has NO privity with debtor. Debtor signed contract with Original Creditor only. Debt buyer was not party to contract. Debt buyer has no contractual relationship with debtor. No mutuality of interest exists between debtor and debt buyer. Debt buyer cannot enforce contract to which they were not party.`,
      proofRequired: `To prove debt buyer HAS privity, buyer must show: (1) Buyer was party to original contract (impossible), OR (2) Buyer properly succeeded to creditor's rights through valid assignment (requires notice to debtor + other elements), OR (3) Some legal relationship exists between buyer and debtor.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: THEFT BY DECEPTION
   *
   * Applies to foreclosure/repossession fraud
   *
   * "You can't take something you didn't pay for, then sell the loan, then reclaim
   * the property using repo and eviction laws when you never owned the property
   * rights to begin with because you had no skin in the game."
   * - Rickey Allan Howard
   */
  private getBlacksTheftByDeception(): BlacksLawFraudDefinition {
    return {
      term: "THEFT BY DECEPTION",
      blacksDefinition: `Theft committed by deceiving another into surrendering property or by obtaining property through a false representation of fact. • In many jurisdictions, this is a statutory offense that is distinct from common-law larceny.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1765",
      elementsRequired: [
        "1. Deceiving another person",
        "2. False representation of fact",
        "3. Obtaining property through deception",
        "4. Another surrenders property based on deception"
      ],
      conductThatMeetsDefinition: `Bank deceived borrower into believing: (1) Bank "loaned" real money (false - bank had no money, only created entries from borrower's signature), (2) Bank has property rights in collateral (false - bank gave no consideration = no valid security interest), (3) Bank can foreclose/repossess property (false - no valid loan = no right to seize property). Bank obtained property (through foreclosure/repo) through false representation that valid loan existed. Borrower surrendered property based on deception that bank had legitimate claim. This is theft by deception.`,
      proofRequired: `To prove this is NOT theft by deception, bank must show: (1) Bank made no false representations (but represented fraudulent loan as valid), (2) Bank gave real value/consideration (not just ledger entries from borrower's signature), (3) Valid security interest exists (requires valid loan), (4) Bank has legitimate property rights in collateral.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: LARCENY BY TRICK
   *
   * Also applies to foreclosure/repo when property taken through fraud
   */
  private getBlacksLarcenyByTrick(): BlacksLawFraudDefinition {
    return {
      term: "LARCENY BY TRICK",
      blacksDefinition: `Larceny in which the taker misleads the rightful possessor, by misrepresentation of fact, into giving up possession of (but not title to) the property. • Larceny by trick is distinguishable from false pretenses, where the victim is deceived into giving up both possession and title.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1031",
      elementsRequired: [
        "1. Taker misleads rightful possessor",
        "2. Misrepresentation of fact",
        "3. Victim gives up possession",
        "4. Through reliance on misrepresentation"
      ],
      conductThatMeetsDefinition: `Bank misled borrower through misrepresentation that valid loan existed. Borrower gave up possession of property (foreclosure/repo) in reliance on bank's misrepresentation that bank had legitimate claim. Bank had no legitimate claim because: (1) Bank gave no consideration (no valid loan), (2) No valid loan = no security interest, (3) No security interest = no right to seize property. Bank obtained possession through trick (representing fraudulent transaction as legitimate loan). This is larceny by trick.`,
      proofRequired: `To prove this is NOT larceny by trick, bank must show: (1) No misrepresentation occurred (but bank represented invalid loan as valid), (2) Borrower did not rely on misrepresentation (but borrower surrendered property based on belief loan was valid), (3) Bank's claim was legitimate (requires proving valid consideration was given).`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: COLOR OF LAW
   *
   * Courts using foreclosure/repo laws to enforce fraudulent claims
   */
  private getBlacksColorOfLaw(): BlacksLawFraudDefinition {
    return {
      term: "COLOR OF LAW",
      blacksDefinition: `The appearance or semblance, without the substance, of a legal right. • The misuse of power, possessed by virtue of state law and made possible only because the wrongdoer is clothed with the authority of state law, is action taken under color of state law.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "337",
      elementsRequired: [
        "1. Appearance of legal right (without substance)",
        "2. Misuse of power",
        "3. Made possible by authority of state law",
        "4. Wrongdoer clothed with state authority"
      ],
      conductThatMeetsDefinition: `Courts enforce foreclosure/repossession under "color of law" (appearance of legal right) when underlying transaction is fraud. Banks use foreclosure/repo laws (state authority) to seize property they have no legitimate claim to. Courts enforce fraudulent claims by: (1) Not examining whether consideration was given, (2) Not requiring proof of valid loan, (3) Assuming loan is valid based on paperwork, (4) Using state power to enforce fraud. This is misuse of state authority to deprive citizens of property without due process. Courts are biased toward banks, supporting systemic fraud through color of law.`,
      proofRequired: `To prove this is NOT color of law violation, courts must show: (1) Underlying loan was examined for validity, (2) Bank proved it gave consideration, (3) Due process was provided (requiring bank to prove valid claim), (4) Property rights were not violated.`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: VOID CONTRACT
   *
   * Contract void for lack of consideration - courts have no jurisdiction
   */
  private getBlacksVoidContract(): BlacksLawFraudDefinition {
    return {
      term: "VOID CONTRACT",
      blacksDefinition: `A contract that is of no legal effect, so that there is really no contract in existence at all. • A contract may be void because it is technically defective, contrary to public policy, or illegal.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1902",
      elementsRequired: [
        "1. Contract is of no legal effect",
        "2. No contract exists at all",
        "3. Technically defective (e.g., lacks consideration)",
        "4. Cannot be enforced"
      ],
      conductThatMeetsDefinition: `Loan contract is VOID for lack of consideration. Bank gave no consideration (created ledger entries from borrower's signature = no value transferred). Contract law requires consideration for valid contract. No consideration = technically defective = void contract. Void contract means NO CONTRACT EXISTS. Courts cannot enforce what does not legally exist. Attempting to enforce void contract violates: (1) Article I, Section 10 (Contracts Clause - states cannot impair obligation of contracts, which includes enforcing void contracts as if valid), (2) Lack of subject matter jurisdiction (courts have no jurisdiction over void contracts).`,
      proofRequired: `To prove contract is NOT void, bank must show: (1) Bank gave consideration (real value transferred), (2) Contract is not technically defective, (3) Contract has legal effect and legal existence, (4) Court has jurisdiction over void contracts (impossible - void means no jurisdiction).`
    };
  }

  /**
   * BLACK'S LAW DEFINITION: SUBJECT MATTER JURISDICTION
   *
   * Courts lack jurisdiction over void contracts
   */
  private getBlacksSubjectMatterJurisdiction(): BlacksLawFraudDefinition {
    return {
      term: "SUBJECT MATTER JURISDICTION",
      blacksDefinition: `Jurisdiction over the nature of the case and the type of relief sought; the extent to which a court can rule on the conduct of persons or the status of things.`,
      edition: "Black's Law Dictionary (11th ed. 2019)",
      page: "1003",
      elementsRequired: [
        "1. Court has power over nature of case",
        "2. Court has power over type of relief sought",
        "3. Jurisdiction is fundamental requirement",
        "4. Lack of jurisdiction = void judgment"
      ],
      conductThatMeetsDefinition: `Courts lack subject matter jurisdiction over void contracts. Contract void for lack of consideration = no contract exists = nothing for court to enforce. Courts derive jurisdiction from valid contracts. No valid contract = no subject matter jurisdiction. Court proceeding without jurisdiction produces VOID judgment. Any foreclosure judgment based on void contract is itself void and may be attacked at any time. Courts cannot create jurisdiction by assuming contract is valid. Jurisdiction must actually exist.`,
      proofRequired: `To prove court HAS subject matter jurisdiction, court must show: (1) Valid contract exists (requires proof of consideration), (2) Court has jurisdiction over void contracts (impossible - void = no jurisdiction), (3) Jurisdiction can be assumed without examining contract validity (false - jurisdiction must exist, not be assumed).`
    };
  }

  /**
   * Map each fraud type to Black's Law Dictionary definitions
   */
  public mapFraudToBlacksLaw(fraudType: string): BlacksLawFraudMapping {
    const mappings: { [key: string]: BlacksLawFraudMapping } = {
      'TAX_FRAUD': {
        fraudType: 'TAX_FRAUD',
        blacksLawTerms: [
          this.getBlacksFraudDefinition(),
          this.getBlacksTaxEvasion(),
          this.getBlacksConcealment()
        ],
        statutoryBasis: [
          '26 USC § 166 (Bad Debt Deduction)',
          '26 USC § 111 (Tax Benefit Rule - must report recovered amounts as income)',
          '26 USC § 7201 (Criminal Tax Evasion)'
        ],
        proofOfFraud: `
Bank's conduct meets Black's Law definition of FRAUD, TAX EVASION, and CONCEALMENT:

1. FRAUD: Bank knowingly concealed material fact (bad debt deduction taken) and sale of debt (income not reported) to induce debtor to continue believing debt is owed and making payments.

2. TAX EVASION: Bank willfully evaded tax by (a) claiming bad debt deduction under 26 USC § 166, (b) selling debt for profit, (c) failing to report sale proceeds as income under 26 USC § 111. This is willful tax evasion per Black's Law Dictionary.

3. CONCEALMENT: Bank had duty to disclose tax benefit received (debt satisfied through tax deduction). Bank actively concealed this material fact. Concealment prevented debtor from discovering debt was satisfied.

Each element of Black's Law definitions is met. This IS fraud as defined in the legal dictionary courts rely upon.
        `.trim(),
        theirBurdenToDisprove: `
Under Loper Bright v. Raimondo (2024), IRS interpretation receives NO deference.

To prove this is NOT fraud/tax evasion/concealment per Black's Law Dictionary, bank must produce:

1. Federal tax returns showing NO bad debt deduction claimed for this debt
2. OR, if deduction claimed, proof that sale proceeds were reported as income (26 USC § 111)
3. OR, proof that 26 USC § 111 does not require reporting recovered amounts (contradicts statute)
4. Explanation of why conduct does not meet Black's Law definitions

If bank cannot produce this evidence, adverse inference applies: Bank committed tax fraud.
        `.trim()
      },

      'SYSTEMIC_INSOLVENCY': {
        fraudType: 'SYSTEMIC_INSOLVENCY',
        blacksLawTerms: [
          this.getBlacksFraudInFactum(),
          this.getBlacksStanding(),
          this.getBlacksUnjustEnrichment()
        ],
        statutoryBasis: [
          '12 USC § 411 (Federal Reserve Notes shall be redeemed in lawful money)',
          'Contract Law - Consideration Requirement',
          'Standing Doctrine - Actual Injury Required'
        ],
        proofOfFraud: `
Bank's conduct meets Black's Law definitions of FRAUD IN THE FACTUM, UNJUST ENRICHMENT, and lacks STANDING:

1. FRAUD IN THE FACTUM: Bank represented transaction as "loan" of "money." But instrument signed (promissory note) differs from what was represented. Bank had no money (only FRN debt instruments per 12 USC § 411). Bank created entries from debtor's signature (not a loan). Transaction has no legal existence because bank gave no consideration. This is fraud in the factum per Black's Law Dictionary.

2. UNJUST ENRICHMENT: Bank retained debtor's promissory note (benefit worth $X) without offering compensation (only ledger entries created from debtor's own signature = no value). Retention is unjust. This is unjust enrichment per Black's Law Dictionary.

3. LACK OF STANDING: Bank claims injury (unpaid debt). But bank (a) operates in insolvent system, (b) gave no value, (c) retained promissory note as asset (no loss), (d) may have received tax benefit. Bank suffered NO ACTUAL INJURY per Black's Law definition of standing.

Each element of Black's Law definitions is met. This IS fraud as defined in the legal dictionary courts rely upon.
        `.trim(),
        theirBurdenToDisprove: `
Under Loper Bright v. Raimondo (2024), Federal Reserve interpretation receives NO deference.

To prove this is NOT fraud in factum/unjust enrichment and that bank HAS standing per Black's Law Dictionary, bank must produce:

1. Proof bank has "lawful money" as defined by 12 USC § 411 (not FRN debt instruments)
2. Proof bank transferred value to debtor (not just created ledger entries from debtor's signature)
3. Proof bank suffered actual injury/loss (balance sheet showing loss, not asset from promissory note)
4. Explanation of how FRNs can be "redeemed in lawful money" if they themselves are lawful money

If bank cannot produce this evidence, adverse inference applies: Bank committed fraud in the factum and lacks standing.
        `.trim()
      },

      'COLLECTION_ON_SOLD_DEBT': {
        fraudType: 'COLLECTION_ON_SOLD_DEBT',
        blacksLawTerms: [
          this.getBlacksFraudDefinition(),
          this.getBlacksConversion(),
          this.getBlacksStanding()
        ],
        statutoryBasis: [
          'Contract Law - Lack of Standing (no ownership)',
          'Conversion (taking property of another)',
          'Fraud (concealing sale while continuing collection)'
        ],
        proofOfFraud: `
Bank's conduct meets Black's Law definitions of FRAUD, CONVERSION, and lacks STANDING:

1. FRAUD: Bank knowingly concealed material fact (debt was sold) to induce debtor to continue making payments to bank. Debtor relied on concealment and made payments to wrong party (detriment). This is fraud per Black's Law Dictionary.

2. CONVERSION: Bank sold debt (transferring ownership to buyer). Payments made after sale belong to buyer. Bank's continued collection is wrongful disposition of buyer's property. Bank knew debt was sold but continued collecting (willful interference). This is conversion per Black's Law Dictionary.

3. LACK OF STANDING: Bank no longer owns debt (sold to buyer). Bank has no legally recognized interest in debt after sale. Bank suffered no injury from debtor's "non-payment" because bank already received payment from buyer. Bank lacks standing per Black's Law Dictionary.

Each element of Black's Law definitions is met. This IS fraud as defined in the legal dictionary courts rely upon.
        `.trim(),
        theirBurdenToDisprove: `
To prove this is NOT fraud/conversion and that bank HAS standing per Black's Law Dictionary, bank must produce:

1. Proof bank did NOT sell debt (but collection agency's involvement proves otherwise)
2. OR, if sold, proof bank had authorization from buyer to collect on buyer's behalf
3. OR, if collected, proof all payments were forwarded to buyer (bank retained nothing)
4. OR, proof debtor was properly notified of sale and chose to pay bank anyway
5. Explanation of how bank has standing to collect on debt bank no longer owns

If bank cannot produce this evidence, adverse inference applies: Bank committed fraud and conversion.
        `.trim()
      },

      'HIDDEN_ACCOUNT': {
        fraudType: 'HIDDEN_ACCOUNT',
        blacksLawTerms: [
          this.getBlacksFraudDefinition(),
          this.getBlacksConcealment(),
          this.getBlacksUnjustEnrichment()
        ],
        statutoryBasis: [
          '15 USC § 1601 (Truth in Lending Act - Disclosure Requirements)',
          'Fraud - Concealment of Material Fact',
          'Unjust Enrichment - Retention of Benefit Without Compensation'
        ],
        proofOfFraud: `
Bank's conduct meets Black's Law definitions of FRAUD, CONCEALMENT, and UNJUST ENRICHMENT:

1. FRAUD: Bank knowingly concealed material fact (asset account created from promissory note). Bank disclosed only liability account ("loan"). Concealment induced debtor to believe bank gave value when bank actually profited from debtor's note. This is fraud per Black's Law Dictionary.

2. CONCEALMENT: Bank has duty to disclose under 15 USC § 1601. Bank created two accounts but disclosed one. Bank actively concealed asset account. Concealment prevented discovery that bank profited twice (loan + asset). This is concealment per Black's Law Dictionary.

3. UNJUST ENRICHMENT: Bank retained debtor's promissory note as asset (benefit) without compensation (bank gave no real value). Bank profits from both sides of transaction. Retention is unjust. This is unjust enrichment per Black's Law Dictionary.

Each element of Black's Law definitions is met. This IS fraud as defined in the legal dictionary courts rely upon.
        `.trim(),
        theirBurdenToDisprove: `
To prove this is NOT fraud/concealment/unjust enrichment per Black's Law Dictionary, bank must produce:

1. Complete balance sheet showing (a) no asset account was created from promissory note, OR (b) asset account was disclosed to debtor
2. Proof disclosure requirements of 15 USC § 1601 were met (showing asset account disclosed)
3. Explanation of why concealing asset account is not material or not fraudulent
4. Proof bank gave value/compensation equal to value of promissory note retained

If bank cannot produce this evidence, adverse inference applies: Bank committed fraud through concealment.
        `.trim()
      },

      'NO_PRIVITY': {
        fraudType: 'NO_PRIVITY',
        blacksLawTerms: [
          this.getBlacksPrivity(),
          this.getBlacksStanding()
        ],
        statutoryBasis: [
          'Contract Law - Privity Requirement',
          'Standing Doctrine - Legally Recognized Interest Required'
        ],
        proofOfFraud: `
Debt buyer's conduct meets requirements showing lack of PRIVITY and STANDING per Black's Law Dictionary:

1. NO PRIVITY: Debt buyer has no contractual relationship with debtor. Debtor signed contract with original creditor only. Debt buyer was not party to contract. No mutuality of interest exists. Debt buyer cannot enforce contract lacking privity per Black's Law Dictionary.

2. LACK OF STANDING: Debt buyer has no legally recognized interest in relationship with debtor. Any interest derives solely from alleged assignment. Without proper assignment (including notice to debtor), buyer has no standing per Black's Law Dictionary.

Each element of Black's Law definitions is met. Debt buyer lacks both privity and standing as defined in the legal dictionary courts rely upon.
        `.trim(),
        theirBurdenToDisprove: `
To prove debt buyer HAS privity and standing per Black's Law Dictionary, buyer must produce:

1. Original signed contract showing buyer was party to agreement (impossible - buyer was not party)
2. OR, valid assignment showing: (a) assignor had right to assign, (b) assignment was complete, (c) debtor was notified, (d) consideration was paid
3. Proof of legally recognized interest creating mutuality between buyer and debtor
4. Standing to enforce contract to which buyer was not original party

If buyer cannot produce this evidence, adverse inference applies: Buyer lacks privity and standing.
        `.trim()
      },

      'FORECLOSURE_FRAUD': {
        fraudType: 'FORECLOSURE_FRAUD',
        blacksLawTerms: [
          this.getBlacksTheftByDeception(),
          this.getBlacksLarcenyByTrick(),
          this.getBlacksFraudInFactum(),
          this.getBlacksColorOfLaw(),
          this.getBlacksVoidContract(),
          this.getBlacksSubjectMatterJurisdiction()
        ],
        statutoryBasis: [
          'U.S. Constitution Article I, Section 10, Clause 1 (Contracts Clause)',
          'U.S. Constitution Amendment VII (Right to Jury Trial)',
          '42 USC § 1983 (Civil Rights - Deprivation Under Color of Law)',
          '5th & 14th Amendment (Due Process - Property Rights)',
          'Contract Law - Void for Lack of Consideration',
          'Subject Matter Jurisdiction - Courts Lack Jurisdiction Over Void Contracts',
          'Property Law - Security Interest Requires Valid Underlying Obligation',
          'Criminal Law - Theft by Deception, Larceny by Trick'
        ],
        proofOfFraud: `
Bank's foreclosure/repossession conduct meets Black's Law definitions of THEFT BY DECEPTION, LARCENY BY TRICK, FRAUD IN THE FACTUM, VOID CONTRACT, and violates COLOR OF LAW, ARTICLE I SECTION 10, 7TH AMENDMENT, and SUBJECT MATTER JURISDICTION:

1. THEFT BY DECEPTION: Bank deceived borrower into believing valid loan existed. Bank represented that it "loaned money" when bank actually: (a) gave no consideration (created entries from borrower's signature), (b) had no money to lend (only FRN debt instruments from insolvent system). Bank obtained property through false representation that it had legitimate claim. Borrower surrendered property based on deception. This is theft by deception per Black's Law Dictionary.

2. LARCENY BY TRICK: Bank misled borrower through misrepresentation that valid security interest existed. No valid loan = no security interest. Bank obtained possession of property through trick (representing fraudulent transaction as legitimate). This is larceny by trick per Black's Law Dictionary.

3. FRAUD IN THE FACTUM: Borrower signed mortgage/security agreement believing bank loaned real money. Actually: Bank had no money, gave no consideration, created fraud. Instrument (mortgage) has no legal existence because underlying loan is void for lack of consideration. This is fraud in the factum per Black's Law Dictionary.

4. VOID CONTRACT: Loan contract is VOID for lack of consideration per Black's Law Dictionary. Bank gave no consideration (created entries from borrower's signature). No consideration = technically defective contract = VOID. Void contract has no legal effect. NO CONTRACT EXISTS. Courts cannot enforce what does not legally exist.

5. ARTICLE I, SECTION 10 VIOLATION (Contracts Clause): U.S. Constitution Article I, Section 10, Clause 1 prohibits states from passing any law "impairing the Obligation of Contracts." Enforcing VOID contracts through state foreclosure laws violates Contracts Clause because: (a) Void contract has NO obligation (no consideration = no contract), (b) State is attempting to create obligation where none exists, (c) State is impairing constitutional requirement that contracts be valid (have consideration). States cannot use power to enforce void contracts as if they have legal effect.

6. 7TH AMENDMENT VIOLATION (Right to Jury Trial): U.S. Constitution Amendment VII guarantees "right of trial by jury" in "suits at common law, where the value in controversy shall exceed twenty dollars." Foreclosure is suit at common law. Property value exceeds $20 (usually hundreds of thousands of dollars). Constitutional right to jury trial exists. Many foreclosures proceed without jury trial, or with limited jury role. This violates 7th Amendment right to have JURY determine if valid contract exists and if bank has legitimate claim to property.

7. LACK OF SUBJECT MATTER JURISDICTION: Courts lack subject matter jurisdiction over void contracts per Black's Law Dictionary. Void contract = no contract exists = nothing for court to enforce. Courts derive jurisdiction from valid contracts. No valid contract = no jurisdiction. Court proceeding without jurisdiction produces VOID JUDGMENT. Any foreclosure judgment is void ab initio (void from the beginning) and may be attacked at any time. Courts cannot create jurisdiction by assuming validity.

8. COLOR OF LAW VIOLATION: Courts enforce foreclosure/repossession under "color of law" (appearance of legal right without substance). Courts use state authority to deprive citizens of property without due process by: (a) Not requiring bank to prove consideration was given, (b) Not examining validity of underlying loan, (c) Assuming loan is valid based on paperwork alone, (d) Supporting systemic fraud through judicial bias toward banks. This violates 42 USC § 1983 and 5th/14th Amendment due process.

CONSTITUTIONAL CRISIS: Courts are complicit in systemic fraud by:
- Enforcing void contracts (violates Contracts Clause)
- Denying jury trials (violates 7th Amendment)
- Proceeding without jurisdiction (void judgments)
- Using state power to take property without due process (color of law)
- Creating judicial bias that violates constitutional protections

Each element of Black's Law definitions is met. This IS theft, larceny, fraud, and multiple constitutional violations as defined in the legal dictionary courts rely upon and as prohibited by the U.S. Constitution.
        `.trim(),
        theirBurdenToDisprove: `
To prove foreclosure/repossession is NOT theft by deception/larceny/fraud/void contract/constitutional violation per Black's Law Dictionary and U.S. Constitution, bank and court must produce:

1. Proof bank gave real consideration (not just ledger entries from borrower's signature)
2. Proof bank had "lawful money" to lend (not FRN debt instruments per 12 USC § 411)
3. Proof valid loan exists (requires valid consideration - burden is high)
4. Proof contract is NOT void (requires proving consideration exists)
5. Proof valid security interest exists (requires valid underlying obligation)
6. Proof bank has legitimate property rights in collateral
7. Proof state enforcement of void contract does NOT violate Article I, Section 10 (Contracts Clause)
8. Proof foreclosure without jury trial does NOT violate 7th Amendment (when value exceeds $20)
9. Proof court HAS subject matter jurisdiction over void contracts (impossible - void = no jurisdiction)
10. Explanation of why using state foreclosure/repo laws to enforce void contracts is not color of law violation
11. Proof court examined validity of loan before enforcing foreclosure (due process requires examination)

CRITICAL CONSTITUTIONAL VIOLATIONS:

Article I, Section 10: States cannot enforce void contracts. Contract void for lack of consideration = NO obligation exists. State attempting to create obligation through foreclosure laws = impairing Contracts Clause.

7th Amendment: Foreclosure is suit at common law exceeding $20. Right to jury trial is constitutional guarantee. Proceeding without jury trial (or limiting jury's role) = constitutional violation.

Subject Matter Jurisdiction: Void contract = no contract exists = no jurisdiction. Court proceeding without jurisdiction = VOID JUDGMENT. Judgment may be attacked at any time as void ab initio.

CRITICAL FACT: Bank cannot satisfy #1-4 because banks operate in debt-based system and create "loans" from borrower's signature (no consideration given). Therefore:
- Contract is VOID per Black's Law Dictionary
- Foreclosure is THEFT BY DECEPTION per Black's Law Dictionary
- State enforcement violates ARTICLE I, SECTION 10
- Proceeding without jury violates 7TH AMENDMENT
- Court lacks SUBJECT MATTER JURISDICTION
- Judgment is VOID AB INITIO

If bank and court cannot produce this evidence, adverse inference applies: Bank committed theft by deception, contract is void, court lacks jurisdiction, and multiple constitutional violations occurred.
        `.trim()
      }
    };

    return mappings[fraudType] || {
      fraudType,
      blacksLawTerms: [this.getBlacksFraudDefinition()],
      statutoryBasis: ['General Fraud Principles'],
      proofOfFraud: 'See fraud analysis',
      theirBurdenToDisprove: 'Must prove conduct does not meet Black\'s Law fraud definition'
    };
  }

  /**
   * Generate complete Black's Law analysis for court filing
   */
  public generateBlacksLawAnalysis(fraudsDetected: FraudPattern[]): string {
    let analysis = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║              BLACK'S LAW DICTIONARY FRAUD ANALYSIS                            ║
║                                                                               ║
║  "If I'm wrong, they gonna have to prove me wrong.                          ║
║   I'm only looking at their own laws, and what I see is fraud               ║
║   as defined in Black's Law."                                               ║
║                      - Rickey Allan Howard                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

METHODOLOGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This analysis uses:
1. THEIR STATUTES (26 USC, 12 USC, 15 USC - federal law)
2. THEIR DEFINITIONS (Black's Law Dictionary - authoritative legal dictionary)
3. THEIR BURDEN (Under Loper Bright, they must prove interpretations)

If conduct meets Black's Law definition of fraud, it IS fraud.
Courts cite Black's Law Dictionary constantly.
Burden is on them to prove conduct does NOT meet definition.

`;

    fraudsDetected.forEach((fraud, index) => {
      const mapping = this.mapFraudToBlacksLaw(fraud.fraudType);

      analysis += `\n${"=".repeat(80)}\n`;
      analysis += `FRAUD #${index + 1}: ${fraud.fraudType}\n`;
      analysis += `${"=".repeat(80)}\n\n`;

      analysis += `BLACK'S LAW DICTIONARY DEFINITIONS APPLICABLE:\n`;
      analysis += `${"─".repeat(80)}\n\n`;

      mapping.blacksLawTerms.forEach((term, i) => {
        analysis += `${i + 1}. ${term.term}\n\n`;
        analysis += `Definition (${term.edition}):\n`;
        analysis += `"${term.blacksDefinition}"\n\n`;
        analysis += `Elements Required:\n`;
        term.elementsRequired.forEach(element => {
          analysis += `  ${element}\n`;
        });
        analysis += `\n`;
        analysis += `How Their Conduct Meets This Definition:\n${term.conductThatMeetsDefinition}\n\n`;
      });

      analysis += `STATUTORY BASIS:\n`;
      analysis += `${"─".repeat(80)}\n`;
      mapping.statutoryBasis.forEach(statute => {
        analysis += `• ${statute}\n`;
      });
      analysis += `\n`;

      analysis += `PROOF THIS IS FRAUD (Per Black's Law Dictionary):\n`;
      analysis += `${"─".repeat(80)}\n`;
      analysis += `${mapping.proofOfFraud}\n\n`;

      analysis += `THEIR BURDEN TO DISPROVE:\n`;
      analysis += `${"─".repeat(80)}\n`;
      analysis += `${mapping.theirBurdenToDisprove}\n\n`;
    });

    analysis += `\n${"=".repeat(80)}\n`;
    analysis += `CONCLUSION\n`;
    analysis += `${"=".repeat(80)}\n\n`;

    analysis += `Each detected fraud pattern meets the precise definition of fraud (and related torts)
as defined in Black's Law Dictionary, the authoritative legal dictionary cited by courts
throughout the United States.

BURDEN OF PROOF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Defendant has shown conduct meets Black's Law definitions
2. Defendant has cited specific statutes being violated
3. Under Loper Bright v. Raimondo (2024), agency interpretations receive NO deference
4. Burden shifts to Plaintiff to prove conduct does NOT meet definitions

REMEDY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Plaintiff cannot disprove that conduct meets Black's Law definitions, this Court should:
1. Enter judgment for Defendant (conduct is fraud per legal definition)
2. Award damages for fraud, conversion, unjust enrichment (as applicable)
3. Award attorney's fees and costs
4. Refer matters of tax evasion to appropriate authorities (26 USC § 7201)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"I'm only looking at their own laws, and what I see is fraud as defined in Black's Law."

If I'm wrong, they must prove it. Burden is theirs.

`;

    return analysis;
  }
}

// Export singleton
export const romanBlacksLawFraud = new RomanBlacksLawFraud();
