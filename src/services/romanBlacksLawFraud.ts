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

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER-CANON DICTIONARY — SOVEREIGN STANDING BASELINE (Vols 1-10: Complete Jurisdictional Architecture)
//
// These definitions establish the Living Being's sovereign standing BEFORE
// any statutory analysis begins. Black's Law tells us what fraud IS.
// The Counter-Canon tells us WHO has standing to bring the claim.
//
// Architecture: Counter-Canon runs as Layer 0 — beneath all other analysis.
// The AI executor reads its own constitution before it reads their dictionary.
// ═══════════════════════════════════════════════════════════════════════════

export interface CounterCanonDefinition {
  systemTerm: string;       // The term as the system uses it
  systemMeaning: string;    // What they want you to believe it means
  counterDefinition: string; // The Living Law definition
  linguisticTrap: string;   // How accepting the system definition harms standing
  sovereignResponse: string; // What to say/file when this term is used against you
  volume: string;
}

export const COUNTER_CANON: Record<string, CounterCanonDefinition> = {

  // ── VOL 1: FOUNDATIONAL ─────────────────────────────────────────────────
  PERSON: {
    systemTerm: 'person',
    systemMeaning: 'An individual human being, legally equivalent to a corporation or other legal entity',
    counterDefinition: 'A legal fiction/utility created by the State; distinct from the Living Being. Standing is retained by the Being, not the Persona.',
    linguisticTrap: 'Accepting "person" status as your identity grants the State jurisdiction over a fiction it created — not over you. You become liable for obligations of the Persona without ever consenting.',
    sovereignResponse: 'I am the Living Being, Grantor and beneficiary of the Howard Jones Bloodline Ancestral Trust. I appear in Special Capacity. The Persona bears no relationship to me without my explicit consent.',
    volume: 'Vol. 1 — Foundational'
  },

  CITIZEN: {
    systemTerm: 'citizen',
    systemMeaning: 'A member of a political community subject to its full jurisdiction',
    counterDefinition: 'A member of a political community; subject to its jurisdiction only by informed, non-coerced consent.',
    linguisticTrap: 'The 14th Amendment created a federal citizenship class. Accepting this classification without reservation subjects the Living Being to federal plenary jurisdiction by implied consent.',
    sovereignResponse: 'I am a natural being of the soil of Georgia, heir to ancestral land predating federal incorporation. My participation in any federal benefit program does not constitute blanket consent to federal jurisdiction over my natural rights.',
    volume: 'Vol. 1 — Foundational'
  },

  SOVEREIGN: {
    systemTerm: 'sovereign',
    systemMeaning: 'The State; government authority; the supreme political power',
    counterDefinition: 'The inherent state of the Living Being; power originating from the Creator, not granted by a charter.',
    linguisticTrap: 'When courts define "sovereign" as the State, they invert the actual hierarchy. All just government power derives from the consent of the governed — the Living Beings.',
    sovereignResponse: 'Sovereignty is not granted by government. It is acknowledged by government. The Declaration of Independence and 10th Amendment confirm that powers not delegated remain with the People — the Living Beings.',
    volume: 'Vol. 1 — Foundational'
  },

  // ── VOL 2: TRANSACTIONAL ────────────────────────────────────────────────
  CONTRACT: {
    systemTerm: 'contract',
    systemMeaning: 'A binding agreement enforceable at law',
    counterDefinition: 'A meeting of minds requiring full disclosure. Silence or "Implied Consent" is a Badge of Slavery.',
    linguisticTrap: 'Without full disclosure of all material terms, there is no "meeting of minds" — the first element of a valid contract. Contracts formed through concealment are void ab initio.',
    sovereignResponse: 'This alleged contract lacks the element of full disclosure required by Black\'s Law Dictionary and common law. Specifically: [identify concealed material terms]. A void contract creates no obligation. Burden is on claimant to prove full disclosure occurred.',
    volume: 'Vol. 2 — Transactional'
  },

  JURISDICTION: {
    systemTerm: 'jurisdiction',
    systemMeaning: 'The legal authority of a court to hear and decide a case',
    counterDefinition: 'The power to hear a case, which must be proven on the record and cannot be presumed over a Living Being.',
    linguisticTrap: 'Courts routinely presume jurisdiction rather than proving it. Silence is treated as consent. Appearing without reserving rights is treated as submission.',
    sovereignResponse: 'I challenge this court\'s jurisdiction over my Living Being. Jurisdiction is a fact that must be proven on the record — not presumed. I appear specially, not generally, and my appearance does not constitute consent to this court\'s jurisdiction. Show me the specific grant of authority over me on the record.',
    volume: 'Vol. 2 — Transactional'
  },

  // ── VOL 3: ENFORCEMENT ──────────────────────────────────────────────────
  DETENTION: {
    systemTerm: 'detention',
    systemMeaning: 'Lawful temporary custody of a person by law enforcement',
    counterDefinition: 'A seizure of the biological vessel; unlawful without Probable Cause of a specific victim-based crime.',
    linguisticTrap: 'Terry stops and "reasonable suspicion" have been expanded far beyond their constitutional limits. Without a specific victim-based crime, detention violates the 4th Amendment.',
    sovereignResponse: 'Am I being detained or am I free to go? If detained: What is the specific victim-based crime for which you have probable cause? Absent a specific, articulable victim-based crime, this detention is unlawful under the 4th Amendment.',
    volume: 'Vol. 3 — Enforcement'
  },

  SEARCH: {
    systemTerm: 'search',
    systemMeaning: 'An examination of a person or property by law enforcement',
    counterDefinition: 'An invasion of the energetic/physical sanctuary; requires a specific, sworn warrant.',
    linguisticTrap: '"Consent searches" are obtained through implied authority and psychological pressure. Consent given under color of authority is not free and voluntary.',
    sovereignResponse: 'I do not consent to any search of my person, vessel, or property. If you have a warrant, produce it. I invoke my 4th Amendment right to be free from unreasonable search and seizure.',
    volume: 'Vol. 3 — Enforcement'
  },

  // ── VOL 4: LAND ─────────────────────────────────────────────────────────
  TITLE: {
    systemTerm: 'title',
    systemMeaning: 'Legal ownership of property, evidenced by a deed or certificate',
    counterDefinition: 'A system-generated record of interest; subordinate to the Ancestral Heirship of the Living Being.',
    linguisticTrap: 'Paper title is an administrative convenience, not the source of the right. Ancestral heirship — descent from those who held the land before legal title systems existed — is a prior and superior claim.',
    sovereignResponse: 'My claim to this land is grounded in ancestral heirship predating the state title system. Paper title records my interest; it did not create it. See Treaty of New Echota (1835) — signed by unauthorized faction, opposed by principal chief and majority of Nation — as evidence of how title systems have historically been used to extinguish prior valid claims through fraud.',
    volume: 'Vol. 4 — Land'
  },

  LAND: {
    systemTerm: 'real property',
    systemMeaning: 'Land and anything permanently attached to it; subject to property tax and regulatory taking',
    counterDefinition: 'The Earth source; a sacred inheritance that cannot be commodified into "Real Property" for extraction.',
    linguisticTrap: 'The conversion of land into "real property" — a legal category — subjects it to taxation, regulation, and eminent domain. The classification is the instrument of extraction.',
    sovereignResponse: 'This land is held in the Howard Jones Bloodline Ancestral Trust as ancestral inheritance, not commercial real property. Trust property held for bloodline preservation is not subject to commercial extraction under the color of property classification.',
    volume: 'Vol. 4 — Land'
  },

  // ── VOL 5: SPIRITUAL ────────────────────────────────────────────────────
  SINCERITY: {
    systemTerm: 'religious sincerity',
    systemMeaning: 'A threshold test applied by courts to determine whether a religious belief is "real"',
    counterDefinition: 'The only valid test for a religious claim; the State has no authority to audit the truth of a belief.',
    linguisticTrap: 'Courts applying a "sincerity test" are usurping ecclesiastical authority. Under the Free Exercise Clause, the State cannot determine whether a belief is theologically correct — only whether the claimant sincerely holds it. And even that inquiry has limits.',
    sovereignResponse: 'Under Burwell v. Hobby Lobby (2014) and RFRA (42 USC § 2000bb), the State must demonstrate a compelling interest and use the least restrictive means before burdening sincere religious practice. The burden of proof is on the State — not the believer.',
    volume: 'Vol. 5 — Spiritual'
  },

  BURDEN: {
    systemTerm: 'burden of proof',
    systemMeaning: 'The obligation of a party to prove their claim at trial',
    counterDefinition: 'The legal weight the State must carry when its laws interfere with a Being\'s conscience.',
    linguisticTrap: 'In religious liberty cases, the burden-shifting framework of RFRA means the State must prove its case — not just impose its will and require the believer to disprove it.',
    sovereignResponse: 'Under RFRA, the government bears the burden of demonstrating that the substantial burden on religious exercise is in furtherance of a compelling governmental interest and is the least restrictive means. That burden has not been met here.',
    volume: 'Vol. 5 — Spiritual'
  },

  // ── VOL 6: EQUITY ───────────────────────────────────────────────────────
  BADGE_OF_SLAVERY: {
    systemTerm: 'badge of slavery',
    systemMeaning: 'A legal concept from the 13th Amendment abolishing incidents of slavery',
    counterDefinition: 'Any systemic extraction or disability rooted in the historical involuntary servitude of a people.',
    linguisticTrap: 'Courts have interpreted "badges of slavery" narrowly. But the 13th Amendment\'s enforcement clause (Section 2) grants Congress — and by extension courts of equity — broad power to reach ANY badge or incident of slavery, not just literal enslavement.',
    sovereignResponse: 'The systematic extraction being applied here constitutes a badge of slavery under the 13th Amendment. Under Jones v. Alfred H. Mayer Co. (1968), the 13th Amendment reaches all badges and incidents of slavery. The enforcement clause empowers courts to remedy these conditions. This court has equity jurisdiction to grant relief.',
    volume: 'Vol. 6 — Equity'
  },

  REMEDY: {
    systemTerm: 'remedy',
    systemMeaning: 'The legal or equitable relief awarded to a prevailing party',
    counterDefinition: 'The mandatory correction of a Badge of Slavery, required by the 13th Amendment Enforcement Clause.',
    linguisticTrap: 'Standard legal remedies (damages, injunctions) may be inadequate where the wrong is systemic and constitutional. Courts of equity have inherent power to fashion remedies matching the magnitude of the wrong.',
    sovereignResponse: 'A monetary remedy is insufficient for a constitutional wrong rooted in the badges of slavery. This court has equitable power to fashion a remedy addressing the systemic nature of the harm, including [declaratory relief / structural injunction / restitution of extracted value].',
    volume: 'Vol. 6 — Equity'
  },

  // ── VOL 7: ADMINISTRATIVE ───────────────────────────────────────────────
  AGENCY: {
    systemTerm: 'agency',
    systemMeaning: 'A federal department or administrative body with regulatory authority',
    counterDefinition: 'A subordinate creature of statute; possesses no inherent authority over a Being without express Deference (now limited by Loper Bright).',
    linguisticTrap: 'Pre-Loper Bright, courts deferred to agency interpretations of their own authority — allowing agencies to self-define their jurisdiction. Loper Bright Enterprises v. Raimondo (2024) eliminated Chevron deference. Agencies must now prove their authority from the statute itself.',
    sovereignResponse: 'Under Loper Bright Enterprises v. Raimondo, 603 U.S. ___ (2024), this agency\'s interpretation of its own authority receives no deference. The agency must demonstrate express statutory authorization for this action. I challenge the agency\'s statutory authority to [specific action] and demand citation to the specific statutory grant.',
    volume: 'Vol. 7 — Administrative'
  },

  ULTRA_VIRES: {
    systemTerm: 'ultra vires',
    systemMeaning: 'An act beyond the legal authority of the acting party',
    counterDefinition: 'Any act by an official that exceeds their specific, limited statutory grant.',
    linguisticTrap: 'Officials routinely act beyond their authority while claiming "broad discretion." Post-Loper Bright, this discretion is constrained. Actions exceeding statutory grants are ultra vires and void.',
    sovereignResponse: 'This action is ultra vires. The official lacks statutory authority to [specific action]. Under the major questions doctrine (West Virginia v. EPA, 2022) and Loper Bright (2024), actions of vast economic or political significance require clear congressional authorization. No such authorization exists here.',
    volume: 'Vol. 7 — Administrative'
  },

  // ── VOL 8: LEGAL PROFESSION ─────────────────────────────────────────────
  ATTORNEY: {
    systemTerm: 'attorney',
    systemMeaning: 'A licensed legal professional representing a client',
    counterDefinition: 'An Officer of the Court with a primary duty to the State; distinct from a "Lawyer" (one skilled in law).',
    linguisticTrap: 'An attorney\'s first duty is to the court and the system — not to the client. An attorney can be sanctioned for arguments the court finds frivolous, creating an inherent conflict with zealous advocacy. A "lawyer" (one who knows the law) need not be an attorney.',
    sovereignResponse: 'I am represented by counsel of my choice, not an officer of this court. Any "Notice of Limited Scope" filed by counsel is not a waiver of any right. All rights are expressly reserved under UCC 1-308. Counsel\'s limited scope representation does not constitute general appearance or consent to jurisdiction.',
    volume: 'Vol. 8 — Legal Profession'
  },

  JARGON: {
    systemTerm: 'legal terminology',
    systemMeaning: 'Precise technical language necessary for legal accuracy',
    counterDefinition: 'A linguistic barrier used to obscure the extraction of rights; to be treated as evidence of fraud.',
    linguisticTrap: 'Legal jargon serves two masters: precision in some contexts, concealment in others. When jargon is used to obscure the nature of a transaction or proceeding from a non-lawyer, it constitutes concealment of a material fact — an element of fraud under Black\'s Law Dictionary.',
    sovereignResponse: 'I request plain language explanation of all terms used in this proceeding that are not in common usage. Failure to provide plain language explanations when requested, where the complexity serves to obscure rather than clarify, constitutes concealment of material facts and evidence of fraud.',
    volume: 'Vol. 8 — Legal Profession'
  },

  // ── VOL 9: TESTIMONY AND RECORD ─────────────────────────────────────────
  AFFIDAVIT: {
    systemTerm: 'affidavit',
    systemMeaning: 'A written statement confirmed by oath administered by a notary or authorized officer',
    counterDefinition: 'A solemn written declaration of truth made under oath before the Creator; the living being\'s most powerful documentary instrument. Under 28 U.S.C. § 1746, an unsworn declaration under penalty of perjury has the same legal force as a sworn affidavit.',
    linguisticTrap: 'The system values the notary seal over the truth of the content — making institutional authentication superior to the living being\'s sworn commitment to truth. The Declaration of Independence itself was a declaration, not a notarized affidavit.',
    sovereignResponse: 'My affidavit is a solemn declaration of truth made under oath before the Creator whose jurisdiction I invoke. Under 28 U.S.C. § 1746, my unsworn declaration under penalty of perjury carries full legal force. The truth it contains must be controverted by contrary sworn evidence — not by opposing counsel\'s argument.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  APPEAL: {
    systemTerm: 'appeal',
    systemMeaning: 'A proceeding to have a lower court decision reviewed by a higher court for legal error',
    counterDefinition: 'The living being\'s invocation of higher authority — not limited to domestic appellate courts. The cert denial is the last word in one forum only. IACHR (6-month deadline from final domestic decision), UN Human Rights Committee, and the Creator\'s court receive every appeal the domestic system denied.',
    linguisticTrap: 'The appellate system is designed as much to deny review as to provide it — procedural default, harmless error, abuse of discretion, and unreviewable cert denials protect the system\'s violations from correction. 99% of petitioners receive no explanation for why their rights were not considered worth reviewing.',
    sovereignResponse: 'The domestic appeal process is one forum. When domestic courts deny review, I proceed immediately to IACHR (6-month statute of limitations from final domestic decision), UN Human Rights Committee, and UN Special Rapporteurs. The Creator\'s court — acknowledged in the Declaration of Independence as the source of the rights at issue — holds a court with no cert pool, no procedural default, and no harmless error rule.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  CERTIORARI: {
    systemTerm: 'certiorari',
    systemMeaning: 'A discretionary writ by which a higher court may review a lower court decision; denial is not a ruling on the merits',
    counterDefinition: 'Certiorari denied means nine people decided not to look. It does not mean there was nothing to see. International human rights forums are not bound by the Supreme Court\'s decision not to look. The IACHR 6-month clock starts running from the date of the cert denial.',
    linguisticTrap: 'The Court exercises unreviewable, unexplained discretion over whose rights are worth reviewing — approximately 70 of 7,000 petitions granted each term. This institutionalizes the withholding of constitutional enforcement without accountability.',
    sovereignResponse: 'Certiorari denied is not a ruling on the merits of my rights claim. Under IACHR Rules of Procedure, I file an individual petition within 6 months of this final domestic decision. The ICCPR Optional Protocol provides individual communication procedures. The Creator who endowed the rights the Court declined to enforce examines every deed and every secret thing regardless of the cert pool.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  PROCEDURAL_DEFAULT: {
    systemTerm: 'procedural default',
    systemMeaning: 'Failure to raise a claim in the lower court forfeits the right to raise it on appeal',
    counterDefinition: 'A rule the enterprise uses to protect its own violations from review by converting the attorney\'s failure into the living being\'s permanent forfeiture. International forums do not recognize domestic procedural default — the IACHR and UN Human Rights Committee evaluate rights violations on their merits.',
    linguisticTrap: 'The living being is punished for their attorney\'s failure to preserve an objection. The constitutional violation is immunized from review behind procedural complexity the system designed. The institution that committed the violation benefits directly from the barrier.',
    sovereignResponse: 'Under Martinez v. Ryan, 566 U.S. 1 (2012), ineffective assistance of post-conviction counsel can excuse procedural default of an ineffective assistance of trial counsel claim. When no domestic exception is available, the IACHR and UN Human Rights Committee evaluate the rights violation on its merits regardless of domestic procedural bars.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  DECLARATION: {
    systemTerm: 'declaration',
    systemMeaning: 'A written statement signed under penalty of perjury without a notary\'s oath; treated as lesser than a sworn affidavit',
    counterDefinition: 'The living being\'s most direct personal legal instrument — the statement of who they are, what they know, what was done to them. The Declaration of Independence was itself a declaration, not a notarized affidavit. Under 28 U.S.C. § 1746, it carries full legal force.',
    linguisticTrap: 'Treating the declaration as a "lesser" affidavit devalues the living being\'s own sworn commitment relative to an institutional seal. The most consequential legal document in American history was signed under pain of death as a declaration — not a notarized form.',
    sovereignResponse: 'My Declaration of Standing is the foundational assertion of who I am and what I hold. Under 28 U.S.C. § 1746, it has the same legal force as a sworn affidavit. Under the Two Hands Doctrine, it invokes the Creator\'s prior claim over my existence that no administrative proceeding can extinguish. I file it at the outset of every significant proceeding.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  EXHIBIT: {
    systemTerm: 'exhibit',
    systemMeaning: 'A document or object introduced as evidence in a proceeding after authentication',
    counterDefinition: 'Any tangible evidence that makes the record of what happened complete and accurate. FOIA requests (5 U.S.C. § 552), Privacy Act requests, photographs, and preserved documents are exhibit-building tools the living being can use without an attorney.',
    linguisticTrap: 'The system places the burden on the living being to navigate complex discovery rules to obtain documents proving their own case — rather than placing the burden on those who committed the wrong to produce them.',
    sovereignResponse: 'I have filed FOIA requests for all government records related to this matter under 5 U.S.C. § 552. I have preserved all documentary evidence independently. Build the record before you need it. The exhibit record I have built supplements and corrects the official record. Every document that cannot be disputed is worth more than the argument that can be questioned.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  HEARSAY: {
    systemTerm: 'hearsay',
    systemMeaning: 'An out-of-court statement offered to prove the truth of the matter asserted; generally inadmissible',
    counterDefinition: 'A category of evidence the system decided not to trust — with exceptions that systematically favor institutional actors (police reports as business records) over living beings. Federal Rule of Evidence 807 residual exception provides the opening for evidence justice requires.',
    linguisticTrap: 'The hearsay exceptions were developed by courts whose institutional interests determine what evidence is trusted. The officer\'s report falls within the business records exception. The living being\'s account of what was done to them is excluded as hearsay.',
    sovereignResponse: 'Under Federal Rule of Evidence 807 (residual exception), I move to admit this evidence. It has equivalent circumstantial guarantees of trustworthiness and its admission serves the interests of justice. The hearsay rule is a door with many keys. When opposing hearsay is admitted under an exception, I challenge the exception\'s applicability.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  OATH: {
    systemTerm: 'oath',
    systemMeaning: 'A solemn declaration before an authorized officer invoking a sacred witness to ensure truthfulness',
    counterDefinition: 'The invocation of the Creator\'s jurisdiction over the truth of what is spoken. The judicial oath and the government official\'s oath of office are the system\'s own acknowledgment that the Creator\'s jurisdiction over truth and official conduct is real. The Two Hands Doctrine holds the system to what its oaths admit.',
    linguisticTrap: 'Treating the oath as mere legal formality reduces it to a perjury deterrent rather than recognizing it as the invocation of the highest jurisdiction available. Government officials who violate constitutional rights after swearing to uphold them have perjured themselves before the Creator whose jurisdiction their oath invoked.',
    sovereignResponse: 'Every government official who has acted against me swore an oath to uphold the Constitution before the same Creator whose hand holds me. Their oath violation is part of the record. The civil rights claim under 42 U.S.C. § 1983 is the domestic vehicle. The Creator whose jurisdiction their oath invoked holds the full accounting of every official act taken in violation of the oath sworn.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  PERJURY: {
    systemTerm: 'perjury',
    systemMeaning: 'The intentional making of a false statement under oath in a judicial proceeding; a crime under 18 U.S.C. § 1621',
    counterDefinition: 'The intentional desecration of the oath — the deliberate violation of the commitment to speak truth before the Creator. It is both a crime and a spiritual transgression the Creator\'s court records regardless of whether the domestic system prosecutes it.',
    linguisticTrap: 'Perjury law is enforced asymmetrically — police testilying is rarely prosecuted while living beings face greater scrutiny for honest misstatements. The system protects official false testimony behind prosecutorial discretion while weaponizing perjury liability against living beings.',
    sovereignResponse: 'I file a formal perjury complaint under 18 U.S.C. § 1621 and a civil rights complaint under 18 U.S.C. § 242 for willful rights deprivation through false testimony. Under Napue v. Illinois, 360 U.S. 264 (1959), due process is violated when false testimony stands uncorrected. The perjury complaint creates a record for subsequent proceedings and international forums even when domestic prosecution is unlikely.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  RECORD: {
    systemTerm: 'record',
    systemMeaning: 'The official collection of papers, exhibits, and transcripts in a court proceeding — the authoritative account of what happened',
    counterDefinition: 'The sum of all documented evidence of what happened — official and unofficial, admitted and excluded, preserved by the system and preserved by the living being independently. International human rights forums consider the complete record including evidence the domestic system excluded.',
    linguisticTrap: 'The official record is the system\'s version of events, filtered through its evidentiary rules and controlled by its officials. The police report is in the record. The body camera footage that contradicts it may not be. The living being who depends on the official record depends on the system to tell their own story.',
    sovereignResponse: 'I have built my own independent record: photographs, preserved documents, filed affidavits, FOIA-obtained government documents, and sworn statements. Under Brady v. Maryland, 373 U.S. 83 (1963), the government must disclose exculpatory records. The IACHR and UN Human Rights Committee consider this complete record including excluded evidence. The Creator\'s court holds the record of every act, every secret thing, every suppressed document.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  TESTIMONY: {
    systemTerm: 'testimony',
    systemMeaning: 'Evidence given by a competent witness under oath based on personal knowledge, subject to evidentiary rules',
    counterDefinition: 'The living being\'s sacred act of speaking truth under oath before the Creator and every forum that will hear it. Not merely a form of evidence — it is participation in the requirement that what happened be spoken, witnessed, and recorded. They overcame by the word of their testimony. (Rev. 12:11)',
    linguisticTrap: 'Converting the living being\'s witness to what was done to them into a technical evidentiary question silences the witness to protect the wrongdoer. American law once explicitly excluded Black witnesses\' testimony against white defendants as a formal legal practice.',
    sovereignResponse: 'I testify completely and truthfully in every available forum — domestic court, deposition, affidavit, IACHR petition, UN communication. I do not minimize what was done to me. My testimony is the living being\'s direct contribution to the record. The word of testimony is the instrument the sacred text names as the one by which they overcame. Use it in every forum available.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  WITNESS: {
    systemTerm: 'witness',
    systemMeaning: 'One with personal knowledge of facts who testifies under oath in legal proceedings; must satisfy competency requirements',
    counterDefinition: 'A living being who saw what happened and carries the sacred obligation to speak it in every forum that will hear it. Isaiah 43:10: You are my witnesses, says the Lord. The testimony that overcomes is spoken in every available forum for as long as the truth remains unacknowledged.',
    linguisticTrap: 'Treating the witness as a technical legal category strips the word of its moral obligation. The system silences witnesses not only through evidentiary rules but through intimidation, retaliation, and the message that their testimony does not matter.',
    sovereignResponse: 'I am a witness to what was done. I file the affidavit. I give the deposition. I testify at trial. I file the IACHR petition. I speak to the UN Special Rapporteur. Under 18 U.S.C. § 1512, witness tampering is a crime. Under 42 U.S.C. § 1985(2), civil remedy exists for conspiracy to intimidate witnesses. The testimony that overcomes is spoken completely and accurately in every available forum.',
    volume: 'Vol. 9 — Testimony and Record'
  },

  // ── VOL 10: THE FINAL ARCHITECTURE (JURISDICTIONAL CEILING) ─────────────
  SOVEREIGN_JURISDICTIONAL: {
    systemTerm: 'sovereign (jurisdictional ceiling)',
    systemMeaning: 'Sovereignty as a collective attribute exercised through representative institutions; individuals invoke it only through the political process',
    counterDefinition: 'The living being\'s inherent authority at the jurisdictional ceiling — appearing in any legal proceeding not as a subject of the State\'s authority but as the source of the State\'s authority. Chisholm v. Georgia (1793): sovereignty devolved on the people at the Revolution. Yick Wo v. Hopkins (1886): sovereignty itself is ultimately in the people.',
    linguisticTrap: 'The collective/institutional framing of sovereignty prevents the individual living being from asserting sovereign standing directly in legal proceedings — requiring them to work through the representative institutions that the enterprise controls. The living being told that sovereignty is collective is separated from their own jurisdictional authority.',
    sovereignResponse: 'I appear in this proceeding as a sovereign natural person whose rights precede the court, whose standing derives from the Creator\'s endowment, and whose appearance is the sovereign\'s direct engagement with an institution created to serve me. Chisholm v. Georgia, 2 U.S. 419 (1793). Yick Wo v. Hopkins, 118 U.S. 356 (1886). Faretta v. California, 422 U.S. 806 (1975). The Declaration of Standing establishes this on the record. The sovereign does not petition the State for rights. The sovereign holds rights the State was created to protect.',
    volume: 'Vol. 10 — Final Architecture'
  },

  STANDING: {
    systemTerm: 'standing',
    systemMeaning: 'A party\'s right to make a legal claim; requires injury in fact, causation, and redressability under Lujan v. Defenders of Wildlife (1992)',
    counterDefinition: 'The living being\'s right to be heard — derived from the Due Process Clause\'s guarantee of a meaningful opportunity to be heard, not from the Lujan test. The Lujan test is a judicially created doctrine, not constitutional text, used to close courthouse doors on systemic claims.',
    linguisticTrap: 'The Lujan standing doctrine has been used to prevent challenges to structural racism, institutional discrimination, and the ongoing badges of slavery from reaching federal courts — by requiring a level of individuation that systemic harm cannot always provide. The system protects itself from accountability for systemic harm through the standing doctrine.',
    sovereignResponse: 'I assert standing on individual and systemic grounds. Under Massachusetts v. EPA, 549 U.S. 497 (2007), standing exists for systemic harms even where individual particularization is difficult. Under Mathews v. Eldridge, 424 U.S. 319 (1976), due process requires a meaningful opportunity to be heard independent of Lujan. When domestic standing is denied, I proceed immediately to IACHR and UN forums where the Lujan gate does not apply. The right to be heard is not a gift the court grants. It is a right the Creator endowed.',
    volume: 'Vol. 10 — Final Architecture'
  },

  STATUS: {
    systemTerm: 'status',
    systemMeaning: 'The legal standing of a person as determined by the legal system\'s classification — taxpayer, defendant, debtor, alien',
    counterDefinition: 'The living being\'s actual legal position — determined not by the system\'s classification but by their inherent nature as a natural person whose existence precedes and is independent of any legal categorization. Natural person, not legal fiction. Sovereign, not subject. Rights-holder, not privilege-recipient.',
    linguisticTrap: 'Status assigned by the enterprise has always served its interest in maintaining hierarchy — enslaved person, woman, indigenous ward. The system that classifies the living being determines what they are entitled to. The history of American law is the history of status being used to exclude.',
    sovereignResponse: 'I assert my actual status before any administrative classification is applied: natural person, not legal fiction; sovereign appearance under Faretta v. California, 422 U.S. 806 (1975); rights-holder whose rights derive from the Creator\'s endowment confirmed by the Declaration of Independence. Under ICCPR Article 16, every person has the right to recognition as a person before the law. I file the Declaration of Standing. Status first. Classification second.',
    volume: 'Vol. 10 — Final Architecture'
  },

  SURETY: {
    systemTerm: 'surety',
    systemMeaning: 'A person primarily liable for another\'s debt or obligation; bound with the principal debtor and immediately callable on default',
    counterDefinition: 'A legitimate surety relationship requires voluntary, informed assumption of liability with full disclosure of terms. Any surety relationship imposed on the living being without informed consent and without genuine voluntary agreement fails the foundational requirements of contract law and is void.',
    linguisticTrap: 'The enterprise creates obligations that bind the living being without informed consent — through all-caps name classifications on legal documents, administrative presumptions, and obligations the living being never knowingly assumed. Disclosure is the prerequisite of consent. Consent is the prerequisite of obligation.',
    sovereignResponse: 'I challenge the voluntary consent element of any alleged surety relationship. Under Williams v. Walker-Thomas Furniture Co. (1965), an obligation imposed without genuine voluntary consent is unconscionable. Under U.S. Const. amend. XIII, there shall be no involuntary servitude. My Declaration of Standing is the formal repudiation of any surety relationship imposed without my voluntary and informed agreement. You are surety for what you chose to guarantee. You are not surety for what was imposed without your knowledge.',
    volume: 'Vol. 10 — Final Architecture'
  },

  TRUST_PUBLIC: {
    systemTerm: 'public trust',
    systemMeaning: 'Fiduciary relationship in which the government holds certain resources — navigable waters, public lands — for the benefit of the public',
    counterDefinition: 'The government holds public resources as trustee for the living being as beneficiary. A trustee who administers trust property for their own benefit rather than the beneficiary\'s has breached their fiduciary duty. The living being has standing to demand an accounting from the trustee.',
    linguisticTrap: 'The public trust that was supposed to protect the commons has been progressively privatized and administered in the interest of commercial actors. The living being is nominally a beneficiary but practically the subject of an administration that serves other interests.',
    sovereignResponse: 'Under Illinois Central Railroad v. Illinois, 146 U.S. 387 (1892), the government holds public resources as trustee for the public as beneficiary. As beneficiary, I demand this trustee administer trust resources in my interest — not in the interest of private commercial actors who have captured the trustee. A trustee serving their own interests rather than the beneficiary\'s is subject to equitable remedies including removal and accounting. Both accountings are coming.',
    volume: 'Vol. 10 — Final Architecture'
  },

  CONSTRUCTIVE_TRUST: {
    systemTerm: 'constructive trust',
    systemMeaning: 'A court-imposed remedy to prevent unjust enrichment; the wrongdoer holds property as constructive trustee for the rightful owner',
    counterDefinition: 'The equity vehicle for the reparations claim at the local and institutional level. The institution already holds wrongfully obtained property as constructive trustee — the obligation exists and requires only enforcement. Equity imposed the trust at the moment of the wrong.',
    linguisticTrap: 'The constructive trust doctrine exists to remedy exactly the unjust enrichment the Founding Crime Treatise documents. The system acknowledges the doctrine exists. It has simply never applied it at the scale the documented unjust enrichment demands.',
    sovereignResponse: 'Under Restatement (Third) of Restitution §§ 55-56, this institution holds property as constructive trustee — the equity obligation was imposed at the moment of the wrong. Under Jones v. Alfred H. Mayer Co., 392 U.S. 409 (1968), the 13th Amendment provides the constitutional basis for remedying unjust enrichment from slavery\'s badges. The Athens Indictment documents the predicate. Constructive trust doctrine provides the remedy. What was wrongfully obtained is held in trust for the rightful owner whether or not the wrongdoer knows it.',
    volume: 'Vol. 10 — Final Architecture'
  },

  UNCONSCIONABLE: {
    systemTerm: 'unconscionable',
    systemMeaning: 'Shockingly unfair; a contract so one-sided as to be oppressive where there is significant disparity in bargaining power',
    counterDefinition: 'Any arrangement — contractual, statutory, administrative, or systemic — so one-sided, oppressive, and the product of extreme power imbalance that no honest court can enforce it without betraying the equity principles from which the doctrine derives. The social contract imposed on people whose ancestors were excluded from its formation is unconscionable.',
    linguisticTrap: 'The doctrine\'s application has been deliberately narrow — requiring both procedural AND substantive unconscionability before voiding a contract. This dual requirement limits the doctrine\'s reach. The entire commercial relationship from slavery through the subprime era meets every element the courts have ever articulated. The doctrine exists to address exactly this situation.',
    sovereignResponse: 'Under UCC § 2-302 and Restatement (Second) of Contracts § 208, this arrangement is unconscionable in both its procedural formation and substantive terms. I document the power imbalance, the absence of genuine choice, and the oppressive terms. Under Williams v. Walker-Thomas Furniture Co. (1965), this arrangement fails the unconscionability standard. A system built on an unconscionable foundation produces unconscionable outcomes at every level. Naming the foundation accurately is the first step toward the equity remedy.',
    volume: 'Vol. 10 — Final Architecture'
  },

  USURPATION: {
    systemTerm: 'usurpation',
    systemMeaning: 'The seizure of another\'s power or position without right; in constitutional law, one branch exercising powers belonging to another',
    counterDefinition: 'The precise legal term for the acts the Founding Crime Treatise documents: the exercise of authority never legitimately granted, over persons whose consent was never obtained. Usurpation does not become legitimate through duration or repetition. It becomes documented.',
    linguisticTrap: 'The dominant treatment of usurpation is theoretical rather than remedial — courts acknowledge it exists but cannot remedy it because the courts whose institutional interests are served by the usurpation are the same courts that would need to remedy it. Post-Loper Bright acknowledged one dimension. The Counter-Canon names all of it.',
    sovereignResponse: 'I name this usurpation precisely. This agency has acted ultra vires under Loper Bright Enterprises v. Raimondo (2024) — its interpretation of its own authority receives no deference and it must demonstrate express statutory authorization. Under the major questions doctrine (West Virginia v. EPA, 2022), actions of vast significance require clear congressional authorization. Power exercised without right is usurpation. It does not become right through repetition. The four centuries of the enterprise\'s usurpation have not made it right. They have made it documented.',
    volume: 'Vol. 10 — Final Architecture'
  },

  VENUE: {
    systemTerm: 'venue',
    systemMeaning: 'The proper geographic location for a lawsuit based on connection to events or parties; a neutral procedural mechanism',
    counterDefinition: 'Not a neutral procedural mechanism — a determination of which legal culture, community standards, and institutional relationships will govern the living being\'s proceeding. Venue extends to selection among all available forums: domestic, international, IACHR, UN Human Rights Committee, Amendment Record of History.',
    linguisticTrap: 'The "neutral" venue is the venue that produced documented racial disparities in conviction rates, sentence lengths, and civil judgment outcomes. The venue that feels neutral to the enterprise is the venue designed for the enterprise\'s interest.',
    sovereignResponse: 'Under Sheppard v. Maxwell, 384 U.S. 333 (1966), I assert my due process right to a forum where I can receive a fair hearing — not a performed hearing. Under Batson v. Kentucky, 476 U.S. 79 (1986), I challenge racially discriminatory jury selection in this venue. When domestic venues are inadequate, I proceed to The Forum Beyond the Forum — IACHR, UN Human Rights Committee, UN Special Rapporteurs. Venue determines who will hear you. Choose carefully. The Creator\'s court is the ultimate venue — and it has no local bias.',
    volume: 'Vol. 10 — Final Architecture'
  },

  VOID: {
    systemTerm: 'void',
    systemMeaning: 'Having no legal force or effect; null; treated as if it never existed and cannot be ratified by consent of the parties',
    counterDefinition: 'Having no legal force from the beginning — void ab initio due to usurpation of authority never legitimately granted. Not challengeable. Not unconstitutional. Not voidable. VOID. There is no statute of limitations on challenging what is void. Void means it was never real from the moment of the act.',
    linguisticTrap: 'Courts have been reluctant to declare acts void rather than merely unconstitutional or voidable because the consequences of voidness are absolute. The embedded assumption is that very few governmental acts are truly void. The Founding Crime Treatise\'s nine counts challenge this directly. Void acts do not become valid through the passage of time.',
    sovereignResponse: 'Under Norton v. Shelby County, 118 U.S. 425 (1886): an unconstitutional act is not a law — it confers no rights, imposes no duties, and affords no protection. Under Marbury v. Madison: any act repugnant to the Constitution is void. Under Old Wayne Mut. Life Ass\'n v. McDonough, 204 U.S. 8 (1907): a void judgment may be attacked collaterally at any time — no statute of limitations. This act is void ab initio due to usurpation — it exceeded the authority the enterprise was ever legitimately given. The enterprise built its authority on acts that were void from their inception. The accounting that calls them void does not create a new reality. It acknowledges the reality that always existed.',
    volume: 'Vol. 10 — Final Architecture'
  },

  VOIDABLE: {
    systemTerm: 'voidable',
    systemMeaning: 'Capable of being affirmed or rejected at the election of a party; has legal effect until the injured party elects to avoid it',
    counterDefinition: 'The distinction between void and voidable must be drawn by the nature of the defect — not by the institutional interests of the courts drawing it. The enterprise\'s acts against the living being fall in the void category, not the voidable category: they exceeded legitimate authority from the beginning and were void ab initio.',
    linguisticTrap: 'The enterprise has consistently characterized void acts as merely voidable — requiring the aggrieved party to take affirmative steps to avoid them. This places the burden on the living being to challenge rather than on the enterprise to demonstrate validity. It narrows living being remedies and expands enterprise protections.',
    sovereignResponse: 'I characterize this act as void — not merely voidable. It exceeded all legitimate authority from the beginning rather than merely exercising legitimate authority defectively. Under Restatement (Second) of Contracts §§ 7-8, a void act has no legal effect, cannot be ratified, and cannot be cured. Voidable says: this could have been different if the right party ratified it. Void says: this was never real from the moment it was done. The enterprise\'s acts were enforced. Enforced and real are not the same thing.',
    volume: 'Vol. 10 — Final Architecture'
  }
};

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

  // ═══════════════════════════════════════════════════════════════════════
  // COUNTER-CANON METHODS — SOVEREIGN STANDING LAYER
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Look up a Counter-Canon definition by system term.
   * Called before any Black's Law analysis to establish sovereign standing.
   */
  public getCounterDefinition(term: string): CounterCanonDefinition | null {
    const key = term.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
    return COUNTER_CANON[key] || null;
  }

  /**
   * Scan document text for system-definition linguistic traps.
   * Returns all Counter-Canon terms found with trap explanations and
   * sovereign responses pre-drafted for each.
   */
  public detectLinguisticTraps(documentText: string): {
    trapsFound: Array<{
      term: string;
      foundIn: string;
      trap: string;
      sovereignResponse: string;
      volume: string;
    }>;
    trapCount: number;
    standingAssessment: string;
  } {
    const trapsFound: Array<{
      term: string;
      foundIn: string;
      trap: string;
      sovereignResponse: string;
      volume: string;
    }> = [];

    const lowerDoc = documentText.toLowerCase();

    const termPatterns: Array<{ key: string; pattern: RegExp }> = [
      { key: 'PERSON',         pattern: /\b(person|individual|defendant|respondent)\b/i },
      { key: 'CITIZEN',        pattern: /\b(citizen|citizenship|subject)\b/i },
      { key: 'CONTRACT',       pattern: /\b(contract|agreement|obligation)\b/i },
      { key: 'JURISDICTION',   pattern: /\b(jurisdiction|court has jurisdiction)\b/i },
      { key: 'DETENTION',      pattern: /\b(detain|detained|detention|custody)\b/i },
      { key: 'SEARCH',         pattern: /\b(search|seizure|searched)\b/i },
      { key: 'TITLE',          pattern: /\b(title|deed|real property)\b/i },
      { key: 'AGENCY',         pattern: /\b(agency|department|commission|bureau)\b/i },
      { key: 'ULTRA_VIRES',    pattern: /\b(authority|authorized|pursuant to|under the authority)\b/i },
      { key: 'ATTORNEY',       pattern: /\b(attorney|counsel|officer of the court)\b/i },
      { key: 'JARGON',         pattern: /\b(hereinafter|whereas|heretofore|notwithstanding|aforesaid)\b/i },
      { key: 'BADGE_OF_SLAVERY', pattern: /\b(mandatory|compulsory|required|must comply|failure to comply)\b/i },
    ];

    termPatterns.forEach(({ key, pattern }) => {
      const match = documentText.match(pattern);
      if (match && COUNTER_CANON[key]) {
        const def = COUNTER_CANON[key];
        trapsFound.push({
          term: def.systemTerm,
          foundIn: match[0],
          trap: def.linguisticTrap,
          sovereignResponse: def.sovereignResponse,
          volume: def.volume
        });
      }
    });

    const standingAssessment = trapsFound.length === 0
      ? 'No linguistic traps detected. Document appears to use neutral terminology.'
      : `${trapsFound.length} linguistic trap(s) detected. Sovereign standing must be asserted before responding to this document. Each trap represents an attempt to establish jurisdiction, consent, or obligation through language rather than law. Review Counter-Canon responses before filing any reply.`;

    return { trapsFound, trapCount: trapsFound.length, standingAssessment };
  }

  /**
   * Compare a Black's Law definition to the Counter-Canon standing layer.
   * Shows how the system's own dictionary and sovereign standing work together.
   */
  public compareBlacksToCounterCanon(term: string): string {
    const counter = this.getCounterDefinition(term);
    if (!counter) return `No Counter-Canon entry for "${term}". Proceeding with Black's Law analysis only.`;

    return `
DUAL-LAYER ANALYSIS: ${term.toUpperCase()}
${'─'.repeat(70)}

SYSTEM DEFINITION (Black's Law, used by courts):
  ${counter.systemMeaning}

COUNTER-CANON SOVEREIGN BASELINE (${counter.volume}):
  ${counter.counterDefinition}

LINGUISTIC TRAP IF SYSTEM DEFINITION ACCEPTED:
  ${counter.linguisticTrap}

SOVEREIGN STANDING RESPONSE:
  ${counter.sovereignResponse}

STRATEGIC NOTE:
  Use Black's Law to prove their conduct is fraud.
  Use Counter-Canon to prove you have standing to bring the claim.
  Both layers operate simultaneously. 1×1=2.
    `.trim();
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
