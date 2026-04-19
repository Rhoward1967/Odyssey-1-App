/**
 * GSCCCA Court Filing Document Generator
 * =======================================
 * Generates clean, print-ready HTML for:
 *   1. Affidavit of Notice and Reservation of Rights
 *   2. Legal Memorandum — People v. Federal Government
 *   3. Notice of Public Record — Article VII-B
 *
 * These are CLEAN documents optimized for GSCCCA eFiling.
 * Google Docs PDFs get rejected. Use Chrome print-to-PDF instead.
 *
 * Run: node scripts/generate-gsccca-docs.mjs
 * Then open each HTML in Chrome → Ctrl+P → Save as PDF
 *   Settings: Paper=Letter | Margins=Default | Headers/Footers=OFF
 */

import { writeFileSync } from 'fs';

const OUTPUT_DIR = 'D:/GSCCCA_FILING';

// ─── Shared CSS ──────────────────────────────────────────────────────────────

const SHARED_CSS = `
  @page { size: letter; margin: 1in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #000;
  }
  h1 {
    font-size: 14pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin: 18pt 0 8pt 0;
  }
  h2 {
    font-size: 13pt;
    text-transform: uppercase;
    font-weight: bold;
    margin: 16pt 0 6pt 0;
    border-bottom: 1px solid #000;
    padding-bottom: 3pt;
  }
  h3 {
    font-size: 12pt;
    font-weight: bold;
    margin: 12pt 0 4pt 0;
  }
  p { margin-bottom: 9pt; text-align: justify; }
  .center { text-align: center; }
  .indent { margin-left: 0.5in; }
  hr { border: none; border-top: 1px solid #000; margin: 14pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 11pt; }
  th, td { border: 1px solid #666; padding: 4pt 8pt; text-align: left; vertical-align: top; }
  th { background: #f0f0f0; font-weight: bold; }
  .sig-block { margin-top: 30pt; }
  .sig-line { display: inline-block; border-top: 1px solid #000; width: 3in; margin-top: 24pt; }
  .notary-block { margin-top: 24pt; padding: 16pt; border: 1px solid #000; }
  .seal-box {
    display: inline-block;
    width: 2in;
    height: 2in;
    border: 2px solid #000;
    text-align: center;
    line-height: 2in;
    font-size: 9pt;
    color: #666;
    margin-top: 8pt;
  }
  .page-break { page-break-before: always; }
  h1, h2 { page-break-after: avoid; }
  table { page-break-inside: avoid; }
`;

function wrapHTML(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>${SHARED_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}

// ─── Document 1: Affidavit ────────────────────────────────────────────────────

function buildAffidavit() {
  const body = `
<h1>Affidavit of Notice and Reservation of Rights</h1>
<p class="center"><strong>Personal Declaration of Rickey Allan Howard</strong></p>
<p class="center">Grounded in Contract Law, Constitutional Law, and the Uniform Commercial Code</p>

<hr/>

<table>
  <tr><th>Document Reference</th><td>RAHN-AFFIDAVIT-CLEAN-032426</td></tr>
  <tr><th>Date of Execution</th><td>March 24, 2026</td></tr>
  <tr><th>County of Execution</th><td>Clarke County, Georgia</td></tr>
  <tr><th>Executed</th><td>WITHOUT PREJUDICE, UCC 1-308</td></tr>
</table>

<hr/>

<h2>Notice to All Parties</h2>

<p>This Affidavit is executed by Rickey Allan Howard, a natural person domiciled in Clarke County, Georgia, acting in his personal and individual capacity. This Affidavit places all creditors, financial institutions, government agencies, municipalities, courts, and all other parties on formal constructive notice of the legal positions asserted herein. All assertions are grounded exclusively in Georgia statutory law, federal constitutional law, the Uniform Commercial Code as adopted, and documented official government publications.</p>

<p>Executed WITHOUT PREJUDICE, UCC 1-308, reserving all rights.</p>

<hr/>

<h2>Part I — Affiant Identification</h2>

<p>I, Rickey Allan Howard, a natural person, 58 years of age, domiciled in Clarke County, Georgia, do solemnly swear and affirm under penalty of perjury that the following facts are true and correct to the best of my knowledge and are submitted for the public legal record.</p>

<hr/>

<h2>Part II — Evidentiary Foundation</h2>
<p><em>Documented Government Admissions — Official Public Record</em></p>

<h3>Finding 2.1 — Treasury Department Financial Statements FY2025</h3>
<p>Total Federal Assets: $6.06 trillion. Total Federal Liabilities: $47.78 trillion. Net Balance Sheet Position: Negative $41.72 trillion. Total liabilities are nearly eight times the value of reported assets. The balance sheet deteriorated by $2.07 trillion in a single fiscal year.</p>

<h3>Finding 2.2 — Total Obligations Including Off-Balance-Sheet</h3>
<p>The Treasury's own Statement of Social Insurance discloses: 75-year unfunded Social Security and Medicare obligations: $88.4 trillion. Combined total federal obligations exceeding $136.2 trillion — approximately five times United States annual Gross Domestic Product.</p>

<h3>Finding 2.3 — Gross National Debt</h3>
<p>The gross national debt crossed $39 trillion on March 17, 2026, per United States Treasury Daily Statement. Annual interest payments are projected to exceed $1 trillion in fiscal year 2026 — surpassing annual national defense expenditure.</p>

<h3>Finding 2.4 — 29 Consecutive Years of Unauditable Financial Statements</h3>
<p>The Government Accountability Office issued a Disclaimer of Opinion on the United States government's Fiscal Year 2025 financial statements. This is the twenty-ninth consecutive year the GAO has been unable to certify whether the government's financial statements are fairly presented. This constitutes an unbroken twenty-nine year failure of material financial disclosure to the American public.</p>

<h3>Finding 2.5 — Expert Confirmation by Former U.S. Comptroller General</h3>
<p>Former United States Comptroller General David M. Walker — the government's own former chief auditor — publicly confirmed on March 23, 2026 that the conclusion of insolvency is drawn directly from the Treasury Department's own published financial statements. This constitutes admission by the government's highest former financial officer.</p>

<h3>Finding 2.6 — Congressional Budget Office Projections</h3>
<p>The Congressional Budget Office February 2026 Baseline projects: Federal deficit of $1.9 trillion in fiscal year 2026; gross federal debt reaching $64 trillion by 2036; risk of debt spiral commencing as early as fiscal year 2031.</p>

<hr/>

<h2>Part III — Legal Framework</h2>
<p><em>Georgia Statutory Law, Federal Constitutional Law, and UCC</em></p>

<h3>3.1 — Georgia Contract Law — Fraud Renders Contracts Voidable</h3>
<p>Under O.C.G.A. § 13-5-5, fraud renders contracts voidable at the election of the injured party. Under O.C.G.A. § 23-2-51, the five elements of fraud include misrepresentation knowingly made relating to a material fact with purpose to deceive, upon which the injured party acted, resulting in injury. Under O.C.G.A. § 51-6-2, willful misrepresentation of a material fact made to induce another to act, upon which such person acts to his injury, gives that person a right of action.</p>
<p><strong>Application:</strong> The United States government, through its agencies and instrumentalities, imposed financial obligations upon Rickey Allan Howard for 58 years while concealing that its own auditors could not certify its financial statements for 29 consecutive years and concealing that its liabilities exceeded its assets by $41.72 trillion. This constitutes material nondisclosure of facts the government was obligated to communicate, satisfying the elements of constructive fraud under O.C.G.A. § 23-2-51.</p>

<h3>3.2 — Georgia Contract Law — Failure of Consideration</h3>
<p>Under O.C.G.A. § 13-3-40, consideration is essential to a valid contract. Under O.C.G.A. § 13-1-8, an entire contract void in part is void in toto.</p>
<p><strong>Application:</strong> Every financial instrument denominated in United States Federal Reserve Notes is an instrument whose underlying consideration — currency backed by a solvent sovereign — has been fundamentally compromised by the sovereign's own published admission of insolvency.</p>

<h3>3.3 — Georgia Contract Law — Unconscionability</h3>
<p>Under O.C.G.A. § 23-2-51, a contract may be subject to rescission where the terms are so fundamentally unfair as to shock the conscience of the court or where there exists gross disparity in bargaining power combined with material nondisclosure.</p>

<h3>3.4 — UCC 1-308 Reservation of Rights</h3>
<p>UCC 1-308 as adopted in Georgia provides that a party that with explicit reservation of rights performs or promises performance does not thereby prejudice the rights reserved. All actions taken by Rickey Allan Howard in connection with any commercial financial instrument are taken WITHOUT PREJUDICE, UCC 1-308, explicitly reserving all rights.</p>
<p><em>Important Clarification:</em> This UCC reservation applies specifically to commercial financial instruments and transactions. It is not asserted as a defense to criminal jurisdiction or as a basis for rejecting lawful court authority.</p>

<h3>3.5 — Constitutional Law — Article I Section 10</h3>
<p>The Constitution of the United States, Article I Section 10, provides that no state shall make anything but gold and silver coin a tender in payment of debts. The abandonment of gold convertibility in 1971 severed the dollar from the constitutional monetary foundation.</p>

<h3>3.6 — Fifth Amendment</h3>
<p>The Fifth Amendment provides that no person shall be deprived of property without due process of law. The systematic debasement of currency through deficit spending by an insolvent sovereign constitutes a taking of the purchasing power of private property without compensation.</p>

<h3>3.7 — Fourteenth Amendment</h3>
<p>Citizens were compelled to enter financial obligations denominated in the currency of a sovereign whose true financial condition was concealed from them for twenty-nine consecutive years. This compulsion without material disclosure constitutes a denial of due process.</p>

<hr/>

<h2>Part IV — Legal Conclusions</h2>

<h3>Conclusion 4.1 — All Current Financial Obligations Subject to Challenge</h3>
<p>Based upon the foregoing documented facts and applicable law, every financial obligation currently asserted against Rickey Allan Howard that is denominated in United States Federal Reserve Notes is subject to challenge on the following independent grounds:</p>
<p class="indent">• Fraud in the inducement under O.C.G.A. § 13-5-5 and § 23-2-51<br/>
• Material nondisclosure constituting constructive fraud under O.C.G.A. § 23-2-51<br/>
• Failure of consideration under O.C.G.A. § 13-3-40<br/>
• Unconscionability under Georgia equity principles<br/>
• Constitutional defect under Article I Section 10<br/>
• Fifth Amendment taking without compensation<br/>
• Fourteenth Amendment denial of due process</p>

<h3>Conclusion 4.2 — The Insolvency Admission Is the Triggering Event</h3>
<p>The government's own published financial statements admitting insolvency constitute the evidentiary foundation for every legal conclusion asserted herein. By placing its financial condition into the public record the government has destroyed the presumption of sovereign solvency underlying all enforcement actions and provided the evidentiary basis for material nondisclosure claims covering 29 years.</p>

<h3>Conclusion 4.3 — Every Transaction Forward Is Tainted</h3>
<p>Every financial transaction conducted from March 23, 2026 forward occurs with the full constructive knowledge of all participating parties that the currency being exchanged is issued by a documented insolvent sovereign.</p>

<h3>Conclusion 4.4 — No Government Municipality or Bank Has Valid Standing</h3>
<p>No government agency, municipality, or financial institution can assert a valid claim for monetary obligations against Rickey Allan Howard without first demonstrating: (1) That the underlying obligation was entered into with full disclosure of the sovereign's financial condition; (2) That the currency in which the obligation is denominated constitutes valid consideration backed by a solvent sovereign; (3) That the legal basis for enforcement survives the failure of consideration, fraud in the inducement, and constitutional defenses asserted herein.</p>

<hr/>

<h2>Part V — Formal Reservations</h2>

<p><strong>Reservation 5.1 — UCC 1-308 Without Prejudice.</strong> All actions taken by Rickey Allan Howard in connection with any commercial financial instrument are taken WITHOUT PREJUDICE, UCC 1-308, reserving all rights without exception as to commercial transactions.</p>

<p><strong>Reservation 5.2 — No Waiver.</strong> No action or inaction by Rickey Allan Howard shall constitute a waiver of any right, defense, or legal position asserted in this Affidavit.</p>

<p><strong>Reservation 5.3 — Affirmative Defense Preservation.</strong> All legal defenses asserted herein are hereby formally preserved as affirmative defenses in any proceeding in which enforcement of a monetary obligation against Rickey Allan Howard is sought.</p>

<p><strong>Reservation 5.4 — Demand for Proof of Claim.</strong> Any party asserting a monetary obligation against Rickey Allan Howard is hereby formally demanded to respond to this demand within thirty (30) days of notice. Failure to respond shall be treated as constructive admission that the obligation cannot withstand the defenses asserted herein.</p>

<hr/>

<h2>Part VI — Notice to Specific Parties</h2>

<p><strong>To All Creditors:</strong> You are hereby placed on formal constructive notice that all monetary obligations purportedly owed by Rickey Allan Howard are subject to the failure of consideration, fraud in the inducement, constructive fraud, and constitutional defenses formally asserted herein.</p>

<p><strong>To All Financial Institutions:</strong> You are hereby placed on formal constructive notice that all accounts and assets associated with Rickey Allan Howard are subject to the legal defenses asserted herein.</p>

<p><strong>To All Government Agencies and Municipalities:</strong> You are hereby placed on formal constructive notice that all monetary assessments, tax demands, fines, and obligations asserted against Rickey Allan Howard are subject to the constitutional and contract law defenses asserted herein.</p>

<p><strong>To All Courts:</strong> This Affidavit is submitted as formal notice that the legal positions asserted herein constitute affirmative defenses to any monetary claim brought against Rickey Allan Howard. These defenses are grounded in Georgia statutory law, federal constitutional law, and the Uniform Commercial Code.</p>

<hr/>

<h2>Part VII — Supporting Evidence</h2>

<p class="indent">1. United States Treasury Department Consolidated Financial Statements, Fiscal Year 2025<br/>
2. Government Accountability Office Disclaimer of Opinion, Fiscal Year 2025 — 29th consecutive year<br/>
3. Congressional Budget Office Budget and Economic Outlook, February 2026<br/>
4. United States Treasury Daily Debt to the Penny Dataset, March 2026<br/>
5. Treasury Statement of Social Insurance — $88.4 trillion in unfunded obligations<br/>
6. Fortune Magazine, March 23, 2026 — authored by former U.S. Comptroller General David M. Walker and Professor Steve H. Hanke, Johns Hopkins University</p>

<hr/>

<h2>Part VIII — Affiant's Declaration</h2>

<p>I, Rickey Allan Howard, do hereby swear and affirm under penalty of perjury under the laws of the State of Georgia and the United States of America that:</p>

<p class="indent">1. The facts stated in this Affidavit are true and correct to the best of my knowledge and belief<br/>
2. The government documents referenced herein are authentic official publications<br/>
3. The legal citations are accurately stated<br/>
4. This Affidavit is executed in good faith for the lawful purpose of asserting documented legal defenses grounded in written law<br/>
5. This Affidavit is not executed for purposes of fraud or any unlawful purpose<br/>
6. This Affidavit is executed WITHOUT PREJUDICE, UCC 1-308, reserving all rights</p>

<hr/>

<div class="sig-block">
  <p>Executed WITHOUT PREJUDICE. UCC 1-308. All Rights Reserved.</p>
  <br/>
  <p>Signature: <span class="sig-line"></span></p>
  <br/>
  <p><strong>Rickey Allan Howard</strong>, Affiant (Living Man, Natural Person)<br/>
  Clarke County, Georgia<br/>
  Date: March 24, 2026</p>
</div>

<div class="notary-block">
  <h3>Notarization</h3>
  <table>
    <tr><th>Notary Public</th><td>Marcel Foley</td></tr>
    <tr><th>State</th><td>Georgia</td></tr>
    <tr><th>County</th><td>Clarke</td></tr>
    <tr><th>Commission Expires</th><td>April 23, 2027</td></tr>
  </table>
  <br/>
  <p>STATE OF GEORGIA<br/>COUNTY OF CLARKE</p>
  <p>The foregoing Affidavit was sworn and subscribed before me this _____ day of March, 2026, by <strong>Rickey Allan Howard</strong>, who is personally known to me or produced identification as described: DL No. 052159561.</p>
  <br/>
  <p>Notary Public Signature: <span class="sig-line"></span></p>
  <br/>
  <p>Printed Name: ______________________________</p>
  <p>My Commission Expires: ______________________________</p>
  <br/>
  <div class="seal-box">[NOTARY SEAL]</div>
</div>
`;
  return wrapHTML('Affidavit of Notice and Reservation of Rights — Rickey Allan Howard', body);
}

// ─── Document 2: Legal Memorandum ────────────────────────────────────────────

function buildMemorandum() {
  const body = `
<h1>Legal Memorandum</h1>

<p class="center"><strong>IN THE MATTER OF:</strong><br/>
The People of the United States of America v. The Federal Government of the United States</p>

<p class="center"><strong>RE:</strong> Declaratory Relief, Voiding of Financial Obligations, and Constitutional Remedy Based on Documented Government Insolvency</p>

<p class="center"><strong>DATE:</strong> March 24, 2026<br/>
<strong>PREPARED FOR:</strong> Pro Bono Legal Review and Public Record</p>

<hr/>

<h2>Preliminary Statement</h2>

<p>This memorandum is submitted for the purpose of establishing a formal legal record regarding the documented insolvency of the United States federal government and the consequent legal effect upon financial contracts, monetary obligations, and instruments denominated in United States currency. This document is submitted in good faith, grounded in published government financial statements, constitutional law, the Uniform Commercial Code, and established contract law doctrine.</p>

<hr/>

<h2>Section I — Statement of Facts</h2>
<p>The following facts are drawn exclusively from official United States government publications and are not in dispute.</p>

<h3>1.1 — Treasury Department Admission of Insolvency</h3>
<p>The United States Treasury Department released its consolidated financial statements for fiscal year 2025. Those statements reveal total assets of $6.06 trillion against total liabilities of $47.78 trillion as of September 30, 2025. Total liabilities are nearly eight times the value of reported assets. The government's consolidated balance sheet deteriorated by $2.07 trillion between fiscal year 2024 and fiscal year 2025, reaching a negative net position of $41.72 trillion.</p>

<h3>1.2 — Off-Balance-Sheet Obligations</h3>
<p>The $47.78 trillion in reported liabilities does not include unfunded obligations of social insurance programs including Social Security and Medicare. The 75-year unfunded social insurance obligation stands at $88.4 trillion as of fiscal year 2025, having surged $10.1 trillion in a single year. When combined with balance sheet liabilities, total federal obligations exceed $136.2 trillion — approximately five times United States annual gross domestic product.</p>

<h3>1.3 — Gross National Debt</h3>
<p>The gross national debt of the United States crossed $39 trillion on March 17, 2026, according to the United States Treasury. Annual interest payments on the national debt are projected to exceed $1 trillion in fiscal year 2026, already surpassing the nation's annual defense spending.</p>

<h3>1.4 — Government Accountability Office Disclaimer</h3>
<p>The Government Accountability Office issued a disclaimer of opinion on the United States government's fiscal year 2025 financial statements. This represents the 29th consecutive year the GAO has been unable to determine whether the government's financial statements are fairly presented. This constitutes an ongoing and unresolved failure of financial accountability.</p>

<h3>1.5 — Congressional Budget Office Projections</h3>
<p>The Congressional Budget Office projects a federal deficit of $1.9 trillion in fiscal year 2026, growing to $3.1 trillion by 2036. Debt held by the public is projected to surge from 101 percent of GDP today to 120 percent of GDP by 2036. Over the next 30 years, the government is projected to spend nearly $100 trillion on interest payments alone.</p>

<h3>1.6 — Oath of Office Obligations</h3>
<p>Every federal official including the President, members of Congress, and federal judges is bound by constitutional oath to support and defend the Constitution of the United States. The Preamble to the Constitution obligates the government to promote the general welfare and secure the blessings of liberty to posterity. The documented fiscal trajectory constitutes a generational taking that directly contradicts these obligations.</p>

<hr/>

<h2>Section II — Constitutional Grounds</h2>

<h3>2.1 — Article I, Section 10</h3>
<p>The Constitution of the United States provides that no state shall make anything but gold and silver coin a tender in payment of debts. The abandonment of the gold standard in 1933 and the termination of the Bretton Woods agreement in 1971 removed the constitutional monetary foundation. The currency currently in circulation is backed solely by confidence in a sovereign that its own financial statements demonstrate to be insolvent.</p>

<h3>2.2 — Fifth Amendment — Taking Without Due Process</h3>
<p>The systematic debasement of the currency through deficit spending and monetary expansion constitutes a taking of private property without due process of law. Every dollar held by an American citizen loses purchasing power through inflation generated by the government's insolvency. This is a taking without compensation.</p>

<h3>2.3 — Fourteenth Amendment — Due Process and Equal Protection</h3>
<p>Citizens are compelled under threat of criminal prosecution to enter into contracts denominated in a currency whose backing sovereign is documented as insolvent. This compulsion without disclosure of the true financial condition of the sovereign constitutes a denial of due process.</p>

<h3>2.4 — Oath Clause Violation</h3>
<p>Officials swearing to defend the Constitution and promote the general welfare while simultaneously administering a fiscal policy that has produced documented insolvency, $136 trillion in total obligations, and generational debt bondage are in breach of their constitutional oath. This breach is documented in the government's own published financial statements.</p>

<hr/>

<h2>Section III — Uniform Commercial Code Grounds</h2>

<h3>3.1 — UCC Section 3-303 — Value and Consideration</h3>
<p>Under the Uniform Commercial Code, an instrument is issued for value if the issuer acquires a right to payment. Where the issuing sovereign is documented as insolvent and the currency has no backing of intrinsic value, the consideration underlying instruments denominated in that currency is compromised.</p>

<h3>3.2 — UCC Section 1-203 — Obligation of Good Faith</h3>
<p>Every contract or duty within the scope of the Uniform Commercial Code imposes an obligation of good faith in its performance and enforcement. The systematic concealment of the government's true financial condition from contracting parties, evidenced by 29 consecutive years of GAO disclaimer opinions, constitutes a failure of good faith.</p>

<h3>3.3 — UCC Section 3-305 — Defenses Against Enforcement</h3>
<p>The UCC recognizes defenses against enforcement of instruments including fraud in the inducement. Where a party entered a financial instrument without knowledge that the monetary foundation of that instrument rested upon a sovereign whose own financial statements demonstrate insolvency, that party has a colorable defense against enforcement.</p>

<hr/>

<h2>Section IV — Contract Law Grounds</h2>

<h3>4.1 — Failure of Consideration</h3>
<p>A contract requires valid consideration from all parties. Where the consideration offered is currency denominated by an insolvent sovereign and backed by no intrinsic value, the consideration is legally defective. Failure of consideration renders a contract void or voidable at the election of the injured party.</p>

<h3>4.2 — Fraud in the Inducement</h3>
<p>Fraud in the inducement occurs where one party to a contract knowingly misrepresents a material fact that induces the other party to enter the contract. The federal government's failure to disclose its true financial condition to parties entering contracts denominated in its currency, while possessing that information through its own financial reporting mechanisms, constitutes fraud in the inducement.</p>

<h3>4.3 — Impossibility of Performance</h3>
<p>Where a sovereign is documented as insolvent and mathematically incapable of meeting its obligations, contracts dependent upon that sovereign's continued financial viability are subject to the doctrine of impossibility of performance.</p>

<h3>4.4 — Meeting of Minds</h3>
<p>A valid contract requires a genuine meeting of minds between parties who understand the true nature of what they are agreeing to. Where one party possesses material information about the worthlessness of the instrument being exchanged and withholds that information, there is no genuine meeting of minds and the contract is void ab initio.</p>

<h3>4.5 — Historical Precedent — Gold Clause Cases 1935</h3>
<p>The United States Supreme Court in the Gold Clause Cases of 1935 upheld the federal government's abrogation of gold payment clauses in contracts. In doing so, the government itself established the precedent that monetary system failure can void existing financial instruments. The government cannot invoke this precedent when it serves its interests while denying its application when monetary failure reaches the point of documented insolvency.</p>

<hr/>

<h2>Section V — Relief Requested</h2>

<p>Based on the foregoing, the People of the United States respectfully request:</p>

<p><strong>5.1</strong> A declaratory judgment that the United States government is in a state of documented insolvency as established by its own published financial statements.</p>

<p><strong>5.2</strong> A declaratory judgment that financial instruments and contracts denominated in United States currency entered into without disclosure of the sovereign's documented insolvency are subject to challenge on grounds of failure of consideration, fraud in the inducement, and absence of genuine meeting of minds.</p>

<p><strong>5.3</strong> Injunctive relief preventing further collection of debt obligations from citizens who were not informed of the true financial condition of the monetary sovereign at the time of contracting.</p>

<p><strong>5.4</strong> Class certification on behalf of all citizens of the United States who have entered into financial obligations denominated in United States currency.</p>

<p><strong>5.5</strong> Appointment of a special master to examine the constitutional adequacy of the current monetary system in light of Article I Section 10 of the Constitution.</p>

<p><strong>5.6</strong> A formal accounting of all federal obligations including off-balance-sheet social insurance obligations presented to the American people in plain language.</p>

<hr/>

<h2>Section VI — Supporting Evidence</h2>

<p class="indent">1. United States Treasury Department Consolidated Financial Statements, Fiscal Year 2025<br/>
2. Government Accountability Office Disclaimer of Opinion, Fiscal Year 2025 (29th consecutive)<br/>
3. Congressional Budget Office Budget and Economic Outlook 2026 to 2036, February 2026<br/>
4. United States Treasury Daily Debt to the Penny Dataset, March 2026<br/>
5. Treasury Statement of Social Insurance showing $88.4 trillion in unfunded obligations<br/>
6. Treasury Statement of Long-Term Fiscal Projections showing widening fiscal gap</p>

<hr/>

<h2>Section VII — Conclusion</h2>

<p>The government of the United States has, through its own published financial statements, provided the evidentiary basis for the arguments contained in this memorandum. This is not a matter of political opinion. These are the government's own numbers, audited by the government's own accountants, who for 29 consecutive years have been unable to certify their accuracy.</p>

<p>The oath sworn by every federal official to promote the general welfare and secure the blessings of liberty to posterity is incompatible with the documented fiscal trajectory. The people of the United States are entitled to relief.</p>

<p>This memorandum is submitted for the public record, for review by attorneys willing to fulfill their professional obligations to serve justice, and as a foundation for formal legal proceedings in the appropriate jurisdiction.</p>

<hr/>

<p><em>This memorandum is prepared for informational and advocacy purposes and submitted for pro bono legal review. It does not constitute legal advice. All factual claims are sourced from official United States government publications.</em></p>

<p><em>Prepared: March 24, 2026</em></p>

<hr/>

<h2>Signature and Notarization</h2>

<p>I, Rickey Allan Howard, hereby submit this Legal Memorandum for the public record and affirm that the factual statements contained herein are drawn from official United States government publications and are true and correct to the best of my knowledge.</p>

<p>Executed WITHOUT PREJUDICE, UCC 1-308, reserving all rights.</p>

<div class="sig-block">
  <p>Signature: <span class="sig-line"></span></p>
  <br/>
  <p><strong>Rickey Allan Howard</strong><br/>
  Grantor — Howard Jones Bloodline Ancestral Trust<br/>
  Clarke County, Georgia<br/>
  Date: ______________________________</p>
</div>

<div class="notary-block">
  <p><strong>STATE OF GEORGIA<br/>COUNTY OF CLARKE</strong></p>
  <p>Before me, a Notary Public in and for the State of Georgia, personally appeared <strong>Rickey Allan Howard</strong>, known to me to be the person whose name is subscribed to the foregoing instrument, and acknowledged that he executed the same for the purposes therein expressed.</p>
  <br/>
  <p>Given under my hand and seal this ______ day of __________________, 2026.</p>
  <br/>
  <p>Notary Public Signature: <span class="sig-line"></span></p>
  <br/>
  <p>Printed Name: ______________________________</p>
  <p>My Commission Expires: ______________________________</p>
  <br/>
  <div class="seal-box">[NOTARY SEAL]</div>
</div>
`;
  return wrapHTML('Legal Memorandum — People v. Federal Government — March 24 2026', body);
}

// ─── Document 3: Notice of Public Record ─────────────────────────────────────

function buildPublicNotice() {
  const body = `
<h1>Notice of Public Record</h1>

<p class="center"><strong>Formal Notice of Affidavit of Sovereign Notice and Reservation of Rights</strong><br/>
<strong>Howard Jones Bloodline Ancestral Trust — Article VII-B</strong><br/>
<strong>Clarke County, Georgia</strong></p>

<hr/>

<p>NOTICE IS HEREBY GIVEN to all parties, agencies, institutions, courts, creditors, and the general public that the following legal instruments have been executed, notarized, and submitted for public record by Rickey Allan Howard, a living man, Grantor of the Howard Jones Bloodline Ancestral Trust, EIN 41-6850149, Clarke County, Georgia.</p>

<hr/>

<h2>Instruments Filed for Public Record</h2>

<table>
  <tr><th colspan="2">Instrument 1</th></tr>
  <tr><th>Title</th><td>Affidavit of Sovereign Notice and Reservation of Rights</td></tr>
  <tr><th>Incorporated as</th><td>Article VII-B of the Howard Jones Bloodline Ancestral Trust</td></tr>
  <tr><th>Trust EIN</th><td>41-6850149</td></tr>
  <tr><th>Grantor</th><td>Rickey Allan Howard, Living Man</td></tr>
  <tr><th>Co-Trustees</th><td>Teara Howard / Joseph Lumpkin Jr.</td></tr>
  <tr><th>Date Executed</th><td>March 24, 2026</td></tr>
  <tr><th>County of Execution</th><td>Clarke County, Georgia</td></tr>
  <tr><th>Governing Law</th><td>Georgia Trust Code O.C.G.A. Title 53 / Common Law / UCC</td></tr>
</table>

<table>
  <tr><th colspan="2">Instrument 2</th></tr>
  <tr><th>Title</th><td>Legal Memorandum — The People of the United States v. The Federal Government</td></tr>
  <tr><th>Date</th><td>March 24, 2026</td></tr>
  <tr><th>Purpose</th><td>Formal legal record of constitutional, UCC, and contract law arguments grounded in the United States Treasury Department's published Fiscal Year 2025 Consolidated Financial Statements</td></tr>
</table>

<hr/>

<h2>Statement of Facts Giving Rise to This Notice</h2>

<p>All parties are hereby placed on constructive notice of the following documented and undisputed facts drawn exclusively from official United States government publications:</p>

<p><strong>Fact 1.</strong> The United States Treasury Department's Consolidated Financial Statements for Fiscal Year 2025 reveal total assets of $6.06 trillion against total liabilities of $47.78 trillion as of September 30, 2025, constituting a documented negative net position of $41.72 trillion.</p>

<p><strong>Fact 2.</strong> When off-balance-sheet social insurance obligations are included, total federal obligations exceed $136.2 trillion — approximately five times United States annual Gross Domestic Product.</p>

<p><strong>Fact 3.</strong> The gross national debt of the United States crossed $39 trillion on March 17, 2026, confirmed by United States Treasury Daily Statement.</p>

<p><strong>Fact 4.</strong> The Government Accountability Office issued a Disclaimer of Opinion on the United States government's Fiscal Year 2025 financial statements — the twenty-ninth consecutive year the GAO has been unable to certify the accuracy of the government's financial statements.</p>

<p><strong>Fact 5.</strong> Former United States Comptroller General David M. Walker and Professor Steve H. Hanke of Johns Hopkins University, writing in Fortune Magazine on March 23, 2026, stated: the conclusion of government insolvency is drawn directly from the Treasury Department's own consolidated financial statements.</p>

<hr/>

<h2>Legal Assertions</h2>

<p>Based upon the foregoing documented facts, the Grantor and the Howard Jones Bloodline Ancestral Trust hereby assert and place all parties on constructive notice of the following legal positions:</p>

<p><strong>Assertion 1 — Failure of Consideration.</strong> All financial instruments, contracts, and monetary obligations denominated in United States Federal Reserve Notes are subject to challenge on grounds of failure of consideration, the sovereign issuing such currency having admitted insolvency through its own published financial statements.</p>

<p><strong>Assertion 2 — Fraud in the Inducement.</strong> Twenty-nine consecutive years of unauditable government financial statements, during which period financial obligations were imposed upon citizens without disclosure of the sovereign's true financial condition, constitutes fraud in the inducement rendering affected instruments void or voidable.</p>

<p><strong>Assertion 3 — Constitutional Defect.</strong> Article I Section 10 of the Constitution of the United States designates gold and silver coin as the only lawful tender for payment of debts. All obligations denominated in unbacked Federal Reserve Notes issued by a documented insolvent sovereign are constitutionally defective.</p>

<p><strong>Assertion 4 — UCC 1-308 Reservation.</strong> All actions taken by the Grantor or the Trust in connection with any financial instrument are taken WITHOUT PREJUDICE, UCC 1-308, reserving all rights.</p>

<p><strong>Assertion 5 — Oath Violation.</strong> Federal officials sworn to promote the general welfare and secure the blessings of liberty to posterity have violated those oath obligations by administering a fiscal policy producing documented insolvency and $136.2 trillion in obligations binding future generations.</p>

<hr/>

<h2>Demand to All Parties</h2>

<p>Any party seeking to enforce any financial obligation against Rickey Allan Howard personally or against the Howard Jones Bloodline Ancestral Trust is hereby formally demanded to:</p>

<p class="indent">1. Demonstrate that the obligation is denominated in currency backed by a solvent sovereign<br/>
2. Demonstrate that valid consideration was exchanged at the time of contracting<br/>
3. Demonstrate that full disclosure of the sovereign's financial condition was made at the time of contracting<br/>
4. Demonstrate legal standing to enforce an obligation denominated in Federal Reserve Notes issued by a documented insolvent sovereign<br/>
5. Respond to this Notice within thirty (30) days of publication or be deemed to have accepted the assertions herein by acquiescence</p>

<p>Failure to respond shall constitute constructive acceptance of the legal positions asserted herein.</p>

<hr/>

<h2>Notice to Specific Parties</h2>

<p><strong>To the Internal Revenue Service:</strong> You are hereby placed on formal constructive notice of the legal positions asserted in the Affidavit incorporated as Article VII-B of the Howard Jones Bloodline Ancestral Trust. All tax filings submitted by the Grantor or the Trust are submitted WITHOUT PREJUDICE, UCC 1-308.</p>

<p><strong>To All Financial Institutions:</strong> You are hereby placed on formal constructive notice that all accounts, deposits, and assets held in the name of Rickey Allan Howard or the Howard Jones Bloodline Ancestral Trust are subject to the trust protections of O.C.G.A. § 53-12-28 and the legal defenses asserted in Article VII-B.</p>

<p><strong>To All Creditors:</strong> You are hereby placed on formal constructive notice that all obligations purportedly owed by Rickey Allan Howard or the Howard Jones Bloodline Ancestral Trust are subject to the failure of consideration, fraud in the inducement, and constitutional defenses formally asserted herein.</p>

<p><strong>To All Courts:</strong> You are hereby placed on formal constructive notice that this Notice, the Affidavit incorporated as Article VII-B of the Trust, and the Legal Memorandum dated March 24, 2026 constitute a foundational defense record that must be addressed before any monetary judgment may be entered against the Grantor or the Trust.</p>

<p><strong>To the General Public:</strong> This Notice is published for the purpose of establishing public record, creating constructive notice to all parties, and contributing to the growing body of documented legal argument regarding the constitutional and commercial law implications of the United States government's admitted insolvency.</p>

<hr/>

<h2>Filing and Publication Record</h2>

<p>This Notice is submitted for filing and publication with the following offices:</p>
<p class="indent">• Clarke County Superior Court Clerk — Athens, Georgia<br/>
• Clarke County Recorder's Office — Athens, Georgia<br/>
• Georgia Secretary of State — UCC Division<br/>
• Legal newspaper of record — Athens, Georgia<br/>
• Library of Congress — for timestamp and federal record</p>

<table>
  <tr><th>Date of First Publication</th><td>March 24, 2026</td></tr>
  <tr><th>County of Publication</th><td>Clarke County, Georgia</td></tr>
</table>

<hr/>

<h2>Affirmation</h2>

<p>I, Rickey Allan Howard, a living man, Grantor of the Howard Jones Bloodline Ancestral Trust, do hereby affirm that this Notice is published in good faith, for lawful purposes, based upon documented and verifiable government publications, and is not published for purposes of fraud, evasion, or any unlawful act. This Notice is executed WITHOUT PREJUDICE, UCC 1-308. All rights reserved.</p>

<div class="sig-block">
  <p>GRANTOR'S SIGNATURE:</p>
  <br/>
  <p>Signature: <span class="sig-line"></span></p>
  <br/>
  <p><strong>Rickey Allan Howard</strong>, Living Man, Grantor<br/>
  Howard Jones Bloodline Ancestral Trust, EIN 41-6850149<br/>
  P.O. Box 80054, Athens, Georgia 30608<br/>
  Date: ______________________________</p>
</div>

<div class="notary-block">
  <p><strong>NOTARIAL ACKNOWLEDGMENT</strong></p>
  <br/>
  <p><strong>STATE OF GEORGIA<br/>COUNTY OF CLARKE</strong></p>
  <p>The foregoing Notice was acknowledged before me this _____ day of ________, 2026, by Rickey Allan Howard, who is personally known to me or produced identification as described below.</p>
  <br/>
  <p>Identification Type: ____________&nbsp;&nbsp;&nbsp;&nbsp;Number: ________________</p>
  <br/>
  <p>Notary Public Signature: <span class="sig-line"></span></p>
  <br/>
  <p>Printed Name: ______________________________</p>
  <p>My Commission Expires: ______________________________</p>
  <br/>
  <div class="seal-box">[NOTARY SEAL]</div>
</div>

<br/>
<p><em>Published without prejudice. UCC 1-308. All rights reserved.</em><br/>
<em>Howard Jones Bloodline Ancestral Trust — EIN 41-6850149</em><br/>
<em>P.O. Box 80054, Athens, GA 30608</em><br/>
<em>First Publication: March 24, 2026</em></p>
`;
  return wrapHTML('Notice of Public Record — Howard Jones Bloodline Ancestral Trust — Article VII-B', body);
}

// ─── Write Files ─────────────────────────────────────────────────────────────

const docs = [
  {
    file: `${OUTPUT_DIR}/01_AFFIDAVIT_OF_NOTICE_RESERVATION_OF_RIGHTS.html`,
    label: 'Affidavit of Notice and Reservation of Rights',
    html: buildAffidavit(),
  },
  {
    file: `${OUTPUT_DIR}/02_LEGAL_MEMORANDUM_PEOPLE_V_FEDERAL_GOVERNMENT.html`,
    label: 'Legal Memorandum — People v. Federal Government',
    html: buildMemorandum(),
  },
  {
    file: `${OUTPUT_DIR}/03_NOTICE_OF_PUBLIC_RECORD_ARTICLE_VII-B.html`,
    label: 'Notice of Public Record — Article VII-B',
    html: buildPublicNotice(),
  },
];

console.log('\n====================================================');
console.log('  GSCCCA COURT FILING DOCUMENT GENERATOR');
console.log('  Howard Jones Bloodline Ancestral Trust');
console.log('====================================================\n');

// Create output dir
import { mkdirSync, existsSync } from 'fs';
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

docs.forEach(({ file, label, html }) => {
  writeFileSync(file, html, 'utf8');
  console.log(`✓ ${label}`);
  console.log(`  → ${file}`);
});

console.log('\n====================================================');
console.log('  HOW TO CREATE GSCCCA-READY PDFs');
console.log('====================================================');
console.log('\nFor EACH of the 3 HTML files:');
console.log('  1. Open in Chrome (double-click the file)');
console.log('  2. Press Ctrl+P (Print)');
console.log('  3. Destination → "Save as PDF"');
console.log('  4. Paper size: Letter');
console.log('  5. Margins: Default');
console.log('  6. UNCHECK "Headers and footers"');
console.log('  7. UNCHECK "Background graphics"');
console.log('  8. Click Save');
console.log('');
console.log('  Save the PDFs as:');
console.log('  01_AFFIDAVIT_OF_NOTICE_RESERVATION_OF_RIGHTS.pdf');
console.log('  02_LEGAL_MEMORANDUM_PEOPLE_V_FEDERAL_GOVERNMENT.pdf');
console.log('  03_NOTICE_OF_PUBLIC_RECORD_ARTICLE_VII-B.pdf');
console.log('');
console.log('  Target size: under 200KB each (vs 1-2MB from Google Docs)');
console.log('');
console.log('  WHY THIS WORKS:');
console.log('  Google Docs PDFs embed fonts, metadata, and complex objects');
console.log('  that GSCCCA format scanners choke on. These clean HTML→PDF');
console.log('  files contain only text and standard CSS — no bloat.');
console.log('');
console.log('====================================================\n');
