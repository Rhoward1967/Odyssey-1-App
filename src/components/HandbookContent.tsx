import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HandbookContentProps {
  activeSection?: string;
}

export default function HandbookContent({ activeSection = 'cover' }: HandbookContentProps) {
  const handbookSections = {
    cover: {
      title: 'HJS Services LLC Employee Handbook',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Employee Handbook</h1>
            <h2 className="text-2xl text-blue-600 mb-2">HJS Services LLC</h2>
            <p className="text-gray-600">Howard Janitorial Services</p>
            <Badge className="mt-4">Updated September 2024</Badge>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Company Information</h3>
            <ul className="space-y-1 text-sm">
              <li>• 36+ years of professional janitorial services</li>
              <li>• BBB Accredited Business</li>
              <li>• Amazon Certified Service Provider</li>
              <li>• Athens Chamber of Commerce Member</li>
            </ul>
          </div>
        </div>
      )
    },
    welcome: {
      title: 'Welcome Message',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Welcome to HJS Services LLC</h2>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Message from Christla Howard, CEO</h3>
            <p className="text-gray-700 leading-relaxed">
              Welcome to the HJS Services family! For over 36 years, we have been committed to 
              providing exceptional janitorial services while maintaining the highest standards 
              of professionalism and integrity. As a new team member, you are now part of a 
              legacy of excellence that has earned us recognition as a BBB Accredited Business 
              and Amazon Certified Service Provider.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Our Mission</h3>
            <p>To provide superior cleaning and maintenance services that exceed our clients' expectations.</p>
            <h3 className="font-semibold">Our Values</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Integrity in all our business dealings</li>
              <li>Excellence in service delivery</li>
              <li>Respect for our employees and clients</li>
              <li>Commitment to continuous improvement</li>
            </ul>
          </div>
        </div>
      )
    },
    about: {
      title: 'About This Manual',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">About This Employee Handbook</h2>
          <p className="text-gray-700">
            This handbook contains important information about your employment with HJS Services LLC. 
            Please read it carefully and keep it for future reference.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Important Note</h3>
            <p className="text-sm">
              This handbook is not a contract of employment. Employment with HJS Services LLC 
              is at-will, meaning either party may terminate the employment relationship at any time, 
              with or without cause, and with or without notice, except as otherwise provided by law.
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Acknowledgment</h3>
            <p className="text-sm text-gray-700">
              By accepting employment with HJS Services LLC, you acknowledge that you have received, 
              read, and understand the policies and procedures outlined in this handbook. You agree 
              to comply with these policies as a condition of your continued employment.
            </p>
            <h3 className="font-semibold">Changes to This Handbook</h3>
            <p className="text-sm text-gray-700">
              HJS Services LLC reserves the right to modify, supplement, or rescind any provision 
              of this handbook at any time, with or without notice. Employees will be notified of 
              significant changes.
            </p>
          </div>
        </div>
      )
    },
    policies: {
      title: 'Company Policies',
      content: (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Company Policies</h2>
          
          {/* Equal Employment Opportunity */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">1. Equal Employment Opportunity (EEO)</h3>
            <p className="text-gray-700">
              HJS Services LLC is an Equal Opportunity Employer. We do not discriminate on the basis of race, 
              color, religion, sex (including pregnancy, gender identity, and sexual orientation), national origin, 
              age, disability, genetic information, veteran status, or any other characteristic protected by federal, 
              state, or local law.
            </p>
            <p className="text-gray-700">
              This policy applies to all terms and conditions of employment, including recruiting, hiring, placement, 
              promotion, termination, layoff, recall, transfer, leaves of absence, compensation, and training.
            </p>
          </div>

            {/* Management & Governance Policies (2025 Update) */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-blue-600">2. Management & Governance Policies</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Operating Agent Appointment:</strong> ODYSSEY-1 AI LLC is the exclusive Operating Agent for HJS SERVICES LLC, responsible for management and operations under a notarized agreement (Dec 10, 2025).
                </li>
                <li>
                  <strong>CEO & Member/Manager:</strong> Christla L. Howard is confirmed as CEO and sole Member/Manager of HJS SERVICES LLC, per the Operating Agreement (Jan 1, 2009).
                </li>
                <li>
                  <strong>Insurance & Compliance:</strong> Commercial General Liability and Auto policies are maintained. All incidents must be reported within 30 days and cooperate with data requests (EDR, GPS).
                </li>
                <li>
                  <strong>Administrative Address:</strong> All official correspondence should be sent to P.O. BOX 80054, Athens GA 30608.
                </li>
                <li>
                  <strong>Limited Liability Safeguard:</strong> Operating Agreement audit confirms the LLC's limited liability status is protected.
                </li>
              </ul>
              {/* Confidential details (succession, UCC filings, legal countermeasures, proprietary IP, trust structures) are excluded from the handbook and kept internal. */}
            </div>

          {/* Anti-Harassment & Anti-Discrimination */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">2. Anti-Harassment & Anti-Discrimination Policy</h3>
            <p className="text-gray-700">
              HJS Services LLC is committed to providing a work environment free from harassment and discrimination. 
              We prohibit harassment of any kind, including sexual harassment, and will take appropriate action to 
              prevent and correct unlawful harassment.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Zero Tolerance</h4>
              <p className="text-sm">
                We have a zero-tolerance policy for harassment, discrimination, or retaliation. Violations will 
                result in disciplinary action, up to and including immediate termination.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Reporting Procedures</h4>
              <p className="text-sm text-gray-700">
                If you experience or witness harassment or discrimination, report it immediately to:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Your immediate supervisor</li>
                <li>HR Department: hr@howardjanitorial.com or 800-403-8492</li>
                <li>CEO Christla Howard: christla@howardjanitorial.com</li>
              </ul>
              <p className="text-sm text-gray-700">
                All complaints will be investigated promptly and confidentially. Retaliation against anyone who 
                reports harassment or participates in an investigation is strictly prohibited.
              </p>
            </div>
          </div>

          {/* Attendance & Punctuality */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">3. Attendance & Punctuality</h3>
            <p className="text-gray-700">
              Regular attendance and punctuality are essential to our business operations. Employees are expected 
              to report to work on time and be ready to work at their scheduled start time.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Reporting Absences</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Notify your supervisor at least 2 hours before your shift if you cannot report to work</li>
                <li>Call directly - do not text or send messages through third parties</li>
                <li>Provide a reason for your absence and expected return date</li>
                <li>Obtain a doctor's note for absences of 3 or more consecutive days</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg mt-3">
              <h4 className="font-semibold mb-2">Excessive Absences</h4>
              <p className="text-sm">
                Excessive absenteeism or tardiness may result in disciplinary action, up to and including termination. 
                Three or more unexcused absences in a 30-day period may be considered job abandonment.
              </p>
            </div>
          </div>

          {/* Drug-Free Workplace */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">4. Drug-Free Workplace Policy</h3>
            <p className="text-gray-700">
              HJS Services LLC is committed to maintaining a safe, healthy, and productive work environment. 
              The use, possession, distribution, or being under the influence of alcohol or illegal drugs during 
              work hours or on company premises is strictly prohibited.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Drug & Alcohol Testing</h4>
              <p className="text-sm text-gray-700">
                Employees may be subject to drug and/or alcohol testing under the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Pre-employment screening</li>
                <li>Reasonable suspicion</li>
                <li>Post-accident or incident</li>
                <li>Random testing (for safety-sensitive positions)</li>
                <li>Return-to-duty testing</li>
              </ul>
            </div>
            <p className="text-sm text-gray-700">
              Refusal to submit to testing or a positive test result will result in termination of employment.
            </p>
          </div>

          {/* Safety & Security */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">5. Workplace Safety & Security</h3>
            <p className="text-gray-700">
              Employee safety is our top priority. All employees must comply with OSHA regulations and company 
              safety policies at all times.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Safety Requirements</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Complete all required safety training before beginning work</li>
                <li>Use personal protective equipment (PPE) as required</li>
                <li>Report all accidents, injuries, and unsafe conditions immediately</li>
                <li>Follow proper procedures for handling chemicals and hazardous materials</li>
                <li>Never operate equipment without proper training and authorization</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg mt-3">
              <h4 className="font-semibold mb-2">Workplace Violence Prevention</h4>
              <p className="text-sm">
                HJS Services LLC has a zero-tolerance policy for workplace violence. Threats, physical altercations, 
                intimidation, or possession of weapons on company property or work sites are strictly prohibited 
                and will result in immediate termination and possible criminal prosecution.
              </p>
            </div>
          </div>

          {/* Confidentiality */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">6. Confidentiality & Data Protection</h3>
            <p className="text-gray-700">
              Employees may have access to confidential company information and client data. You must protect 
              this information and use it only for business purposes.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Confidential Information Includes:</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Client lists, contracts, and pricing information</li>
                <li>Employee personal information and payroll data</li>
                <li>Trade secrets and proprietary business methods</li>
                <li>Financial information and business strategies</li>
                <li>Security codes, passwords, and access information</li>
              </ul>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Unauthorized disclosure of confidential information is grounds for immediate termination and 
              may result in legal action.
            </p>
          </div>

          {/* Code of Conduct */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">7. Code of Conduct & Professional Standards</h3>
            <p className="text-gray-700">
              All employees are expected to conduct themselves professionally and ethically at all times.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Expected Standards</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Treat coworkers, clients, and the public with respect and courtesy</li>
                <li>Maintain professional appearance and hygiene</li>
                <li>Use company time and resources appropriately</li>
                <li>Follow all company policies and procedures</li>
                <li>Avoid conflicts of interest</li>
                <li>Report unethical behavior or policy violations</li>
              </ul>
            </div>
          </div>

          {/* Social Media & Technology */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">8. Social Media & Technology Use</h3>
            <p className="text-gray-700">
              Personal use of social media during work hours should be minimal and should not interfere with 
              job duties. When posting about work-related matters, employees must:
            </p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Not disclose confidential company or client information</li>
              <li>Not make defamatory or disparaging comments about the company, clients, or coworkers</li>
              <li>Identify personal opinions as their own, not representing the company</li>
              <li>Follow all applicable laws and regulations</li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              Company-issued devices and email accounts are for business use. The company reserves the right 
              to monitor electronic communications and computer usage.
            </p>
          </div>
        </div>
      )
    },
    procedures: {
      title: 'Standard Operating Procedures',
      content: (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Standard Operating Procedures</h2>

          {/* Time Tracking */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">1. Time Tracking & Payroll</h3>
            <div className="space-y-2">
              <h4 className="font-semibold">Clocking In/Out</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Clock in at your actual start time using the company time clock system</li>
                <li>Take authorized breaks only - 30-minute unpaid meal break for 6+ hour shifts</li>
                <li>Clock out immediately at the end of your shift</li>
                <li>Never clock in or out for another employee (grounds for termination)</li>
                <li>Report any time clock errors to your supervisor immediately</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Overtime</h4>
              <p className="text-sm text-gray-700">
                Overtime (hours worked over 40 in a workweek) must be approved in advance by your supervisor. 
                Non-exempt employees will be paid time-and-a-half for overtime hours as required by law.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Pay Schedule</h4>
              <p className="text-sm">
                Employees are paid bi-weekly via direct deposit or paper check. Payday is every other Friday. 
                If payday falls on a holiday, payment will be issued on the preceding business day.
              </p>
            </div>
          </div>

          {/* Leave Policies */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">2. Leave Policies</h3>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Family and Medical Leave Act (FMLA)</h4>
              <p className="text-sm text-gray-700">
                Eligible employees may take up to 12 weeks of unpaid, job-protected leave per year for:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Birth and care of a newborn child</li>
                <li>Adoption or foster care placement</li>
                <li>Care for an immediate family member with a serious health condition</li>
                <li>Employee's own serious health condition</li>
                <li>Qualifying military family leave</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                To be eligible, you must have worked for HJS Services for at least 12 months and 1,250 hours 
                in the past year. Contact HR for FMLA paperwork.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="font-semibold">Sick Leave</h4>
              <p className="text-sm text-gray-700">
                Employees accrue [X] hours of paid sick leave per [pay period/year]. Sick leave may be used for:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Personal illness or injury</li>
                <li>Medical appointments</li>
                <li>Care for immediate family member's illness</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                A doctor's note may be required for absences of 3 or more consecutive days.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="font-semibold">Jury Duty & Military Leave</h4>
              <p className="text-sm text-gray-700">
                Employees will be granted unpaid leave for jury duty and military service as required by law. 
                Provide written notice and documentation as soon as possible.
              </p>
            </div>
          </div>

          {/* Dress Code */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">3. Dress Code & Uniform Policy</h3>
            <p className="text-gray-700">
              HJS Services LLC provides uniforms for all employees. You are required to wear your uniform 
              while on duty.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Uniform Requirements</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Wear provided company uniform shirts (clean and in good condition)</li>
                <li>Closed-toe, non-slip work shoes (no sandals or open-toed shoes)</li>
                <li>Long pants (jeans or work pants acceptable - no shorts, leggings, or torn clothing)</li>
                <li>Company-issued ID badge must be visible at all times</li>
                <li>Minimal jewelry (remove if it poses a safety hazard)</li>
              </ul>
            </div>
            <div className="space-y-2 mt-3">
              <h4 className="font-semibold">Personal Hygiene</h4>
              <p className="text-sm text-gray-700">
                Maintain good personal hygiene. Hair must be clean and neatly groomed. Strong fragrances 
                should be avoided as they may trigger allergies in clients.
              </p>
            </div>
          </div>

          {/* Client Interaction */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">4. Client Interaction & Site Access</h3>
            <div className="space-y-2">
              <h4 className="font-semibold">Professional Conduct at Client Sites</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Always be courteous and professional with client personnel</li>
                <li>Follow all client-specific rules and procedures</li>
                <li>Only access areas you are authorized to clean</li>
                <li>Never use client phones, computers, or equipment without permission</li>
                <li>Do not remove anything from client premises</li>
                <li>Report any damage, accidents, or security concerns immediately</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mt-3">
              <h4 className="font-semibold mb-2">Theft Policy</h4>
              <p className="text-sm">
                Theft of any kind is grounds for immediate termination and criminal prosecution. This includes 
                taking client property, company supplies, or coworker belongings.
              </p>
            </div>
          </div>

          {/* Quality Standards */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">5. Quality & Performance Standards</h3>
            <p className="text-gray-700">
              HJS Services LLC has built its reputation on quality service. All employees must:
            </p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Complete all assigned tasks to company standards</li>
              <li>Use proper cleaning techniques and approved products</li>
              <li>Perform walk-through inspections before leaving each site</li>
              <li>Report supply needs before running out</li>
              <li>Notify supervisor immediately of any issues or client complaints</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              Performance reviews are conducted annually. Consistently poor performance may result in 
              additional training, reassignment, or termination.
            </p>
          </div>
        </div>
      )
    },
    benefits: {
      title: 'Benefits & Compensation',
      content: (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Benefits & Compensation</h2>

          {/* Compensation */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">1. Compensation</h3>
            <p className="text-gray-700">
              HJS Services LLC offers competitive wages based on experience, position, and performance.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Pay Structure</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Bi-weekly payroll (every other Friday)</li>
                <li>Direct deposit available (preferred method)</li>
                <li>Overtime paid at 1.5x regular rate for hours over 40/week</li>
                <li>Annual performance reviews with potential merit increases</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-3">
              <h4 className="font-semibold mb-2">Tax Withholding</h4>
              <p className="text-sm">
                Federal, state, FICA, and Medicare taxes are withheld from each paycheck as required by law. 
                Complete Form W-4 during onboarding to specify your withholding preferences.
              </p>
            </div>
          </div>

          {/* Workers Compensation */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">2. Workers' Compensation Insurance</h3>
            <p className="text-gray-700">
              HJS Services LLC provides workers' compensation insurance for all employees. This covers 
              medical expenses and lost wages if you are injured on the job.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Reporting Work-Related Injuries</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Report all work-related injuries immediately to your supervisor</li>
                <li>Complete an incident report within 24 hours</li>
                <li>Seek medical attention at an approved workers' comp provider</li>
                <li>Follow all doctor's orders and treatment plans</li>
                <li>Keep HR informed of your status and return-to-work date</li>
              </ul>
            </div>
          </div>

          {/* Training & Development */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">3. Training & Professional Development</h3>
            <p className="text-gray-700">
              HJS Services LLC invests in employee training to ensure quality service and career advancement.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Training Programs</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>New hire orientation and safety training</li>
                <li>OSHA 30-hour General Industry certification</li>
                <li>Chemical safety and hazard communication</li>
                <li>Client-specific training (Amazon, GSA, etc.)</li>
                <li>Leadership development for supervisory positions</li>
              </ul>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Employees are paid for all required training time.
            </p>
          </div>

          {/* Employee Recognition */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">4. Employee Recognition Programs</h3>
            <p className="text-gray-700">
              We value hard work and dedication. Outstanding employees may be recognized through:
            </p>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>Employee of the Month/Year awards</li>
              <li>Performance bonuses</li>
              <li>Service anniversary recognition</li>
              <li>Referral bonuses for successful new hire referrals</li>
            </ul>
          </div>

          {/* Additional Benefits */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-blue-600">5. Additional Benefits</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Eligible Full-Time Employees May Receive:</h4>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Paid holidays (New Year's Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas)</li>
                <li>Paid time off (PTO) after 90 days of employment</li>
                <li>Health insurance options (after 60 days - full-time employees)</li>
                <li>Flexible scheduling when possible</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Eligibility and specific benefit amounts vary by position and employment status. 
                Contact HR for complete details.
              </p>
            </div>
          </div>

          {/* Separation */}
          <div className="space-y-3 mt-8">
            <h3 className="text-xl font-semibold text-blue-600">6. Separation from Employment</h3>
            <div className="space-y-2">
              <h4 className="font-semibold">Resignation</h4>
              <p className="text-sm text-gray-700">
                Employees who resign are asked to provide at least 2 weeks' written notice. Final paychecks 
                will include all earned wages through the last day worked.
              </p>
            </div>
            <div className="space-y-2 mt-3">
              <h4 className="font-semibold">Return of Company Property</h4>
              <p className="text-sm text-gray-700">
                Upon separation, employees must return all company property including:
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Uniforms and ID badges</li>
                <li>Keys, access cards, and security codes</li>
                <li>Company equipment and supplies</li>
                <li>Any client property in your possession</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                Unreturned property may be deducted from final paycheck to the extent permitted by law.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-100 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold mb-4">Questions? Contact Us</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Human Resources:</strong> hr@howardjanitorial.com</p>
              <p><strong>Phone:</strong> 800-403-8492</p>
              <p><strong>Mailing Address:</strong> P.O. Box 80054, Athens, GA 30608</p>
              <p><strong>Main Office:</strong> 165 Ben Burton Cir, Suite A, Bogart, GA 30622</p>
            </div>
          </div>
        </div>
      )
    }
  };

  const currentSection = handbookSections[activeSection as keyof typeof handbookSections] || handbookSections.cover;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentSection.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentSection.content}
      </CardContent>
    </Card>
  );
}