-- Sample Handbook Content for HJS Services Employee Handbook
-- This migration populates the handbook with initial content based on the company handbook

-- Welcome & Company Overview sections
INSERT INTO handbook_sections (category_id, title, slug, content, summary, is_published, is_mandatory, effective_date, required_role, sort_order) VALUES

-- Welcome & Company Overview
((SELECT id FROM handbook_categories WHERE slug = 'welcome-overview'), 
'Welcome to HJS Services', 'welcome-message', 
'Welcome to HJS Services! We are delighted that you have decided to join our team. As a leading provider of commercial cleaning and janitorial services, we take pride in delivering exceptional service to our clients while maintaining the highest standards of professionalism and integrity.

Our company was founded on the principles of reliability, quality, and customer satisfaction. Every team member plays a crucial role in upholding these values and contributing to our continued success.

This handbook will serve as your guide to understanding our company policies, procedures, and expectations. Please take the time to read through all sections carefully and keep this handbook as a reference throughout your employment with us.

We look forward to working with you and helping you grow professionally within our organization.', 
'Welcome message and company introduction', true, true, CURRENT_DATE, 'staff', 1),

((SELECT id FROM handbook_categories WHERE slug = 'welcome-overview'), 
'Company Mission & Values', 'mission-values', 
'**Our Mission**
To provide superior commercial cleaning and janitorial services that exceed our clients'' expectations while fostering a positive work environment for our employees.

**Our Core Values**

**Integrity**: We conduct business with honesty, transparency, and ethical standards in all our interactions.

**Quality**: We are committed to delivering consistent, high-quality services that meet and exceed industry standards.

**Reliability**: Our clients depend on us, and we take that responsibility seriously by being punctual, consistent, and dependable.

**Respect**: We treat all employees, clients, and partners with dignity and respect, fostering an inclusive workplace.

**Growth**: We support the professional development of our team members and continuously improve our services.

**Safety**: The safety and well-being of our employees and clients is our top priority in everything we do.', 
'Company mission statement and core values', true, true, CURRENT_DATE, 'staff', 2),

((SELECT id FROM handbook_categories WHERE slug = 'welcome-overview'), 
'Organizational Structure', 'organizational-structure', 
'**Management Team**
- **General Manager**: Overall operations and strategic direction
- **Operations Manager**: Daily operations and service delivery coordination
- **Area Supervisors**: Regional oversight and client relationship management
- **Site Supervisors**: On-site team leadership and quality control

**Reporting Structure**
All employees report to their immediate supervisor, who provides guidance, support, and performance feedback. Our open-door policy encourages communication at all levels.

**Communication Channels**
- Direct supervisor for daily operations and immediate concerns
- Area Supervisor for regional issues and escalations  
- Operations Manager for policy questions and procedural matters
- General Manager for company-wide concerns and strategic feedback', 
'Company organizational structure and reporting hierarchy', true, false, CURRENT_DATE, 'staff', 3),

-- Employment Policies
((SELECT id FROM handbook_categories WHERE slug = 'employment-policies'), 
'Equal Employment Opportunity', 'equal-employment', 
'HJS Services is an Equal Opportunity Employer committed to creating an inclusive environment where all employees can thrive regardless of race, color, religion, sex, national origin, age, disability, sexual orientation, gender identity, veteran status, or any other legally protected characteristic.

**Our Commitment**
- Fair hiring practices based solely on qualifications and merit
- Equal opportunities for advancement and professional development
- Zero tolerance for discrimination or harassment
- Reasonable accommodations for employees with disabilities
- Compliance with all federal, state, and local employment laws

**Reporting Discrimination**
Any incidents of discrimination or harassment should be reported immediately to your supervisor, Area Supervisor, or Operations Manager. All reports will be investigated promptly and confidentially.', 
'Equal employment opportunity policies and anti-discrimination commitment', true, true, CURRENT_DATE, 'staff', 1),

((SELECT id FROM handbook_categories WHERE slug = 'employment-policies'), 
'Employment Classification', 'employment-classification', 
'**Full-Time Employees**
- Work 40+ hours per week
- Eligible for all company benefits
- Regular schedule with consistent hours

**Part-Time Employees**  
- Work less than 40 hours per week
- Eligible for pro-rated benefits based on hours worked
- Flexible scheduling available

**Temporary/Seasonal Employees**
- Employed for specific projects or peak periods
- Limited benefit eligibility
- Potential for conversion to regular employment

**Independent Contractors**
- Provide specialized services under contract
- Not eligible for employee benefits
- Separate contract terms and conditions apply', 
'Different types of employment classifications and their characteristics', true, false, CURRENT_DATE, 'staff', 2),

-- Time & Attendance
((SELECT id FROM handbook_categories WHERE slug = 'time-attendance'), 
'Work Schedules', 'work-schedules', 
'**Standard Operating Hours**
Most cleaning services are performed during evening and overnight hours to minimize disruption to client operations.

**Typical Shifts**
- Day Shift: 8:00 AM - 4:00 PM
- Evening Shift: 4:00 PM - 12:00 AM  
- Night Shift: 10:00 PM - 6:00 AM
- Weekend Coverage: Saturday and Sunday as needed

**Schedule Changes**
- Two weeks advance notice required for schedule changes
- Emergency coverage available with supervisor approval
- Flexibility provided when possible for employee needs

**Punctuality**
Arriving on time is essential for maintaining service commitments to our clients. Repeated tardiness may result in disciplinary action.', 
'Work schedule information and time expectations', true, true, CURRENT_DATE, 'staff', 1),

((SELECT id FROM handbook_categories WHERE slug = 'time-attendance'), 
'Time Tracking & Reporting', 'time-tracking', 
'**Time Clock System**
All employees must accurately record their work hours using the designated time tracking system.

**Clocking Procedures**
- Clock in at the start of your shift
- Clock out for unpaid meal breaks (30+ minutes)
- Clock back in after meal breaks
- Clock out at the end of your shift

**Timesheet Review**
- Review your timesheet weekly for accuracy
- Report any discrepancies immediately to your supervisor
- Sign/approve timesheets by the designated deadline

**Overtime Policy**
- Overtime must be pre-approved by your supervisor
- Time and a half pay for hours worked over 40 per week
- Double time for work on designated holidays', 
'Time tracking procedures and overtime policies', true, true, CURRENT_DATE, 'staff', 2),

-- Health & Safety
((SELECT id FROM handbook_categories WHERE slug = 'health-safety'), 
'Safety Protocols', 'safety-protocols', 
'**General Safety Rules**
- Follow all posted safety procedures and guidelines
- Wear required personal protective equipment (PPE)
- Report unsafe conditions immediately to your supervisor
- Participate in all required safety training programs

**Chemical Safety**
- Read and understand all Material Safety Data Sheets (MSDS)
- Use chemicals only as directed and with proper ventilation
- Never mix different cleaning chemicals
- Store chemicals safely and securely

**Equipment Safety**
- Inspect equipment before each use
- Report damaged or malfunctioning equipment immediately
- Use equipment only for its intended purpose
- Follow proper lifting techniques to prevent injury

**Emergency Procedures**
- Know the location of emergency exits and equipment
- Report all accidents and injuries immediately
- Follow evacuation procedures if required
- Contact emergency services when necessary', 
'Workplace safety protocols and emergency procedures', true, true, CURRENT_DATE, 'staff', 1),

-- Compensation & Benefits  
((SELECT id FROM handbook_categories WHERE slug = 'compensation-benefits'), 
'Pay Structure', 'pay-structure', 
'**Pay Periods**
Employees are paid bi-weekly on Fridays for the two-week period ending the previous Sunday.

**Pay Rates**
- Starting wages are competitive with local market rates
- Pay increases based on performance reviews and tenure
- Shift differentials may apply for evening and night shifts
- Premium pay for weekend and holiday work

**Direct Deposit**
We strongly encourage direct deposit for convenience and security. Contact HR to set up direct deposit.

**Pay Stubs**
Electronic pay stubs are available through the employee portal. Contact HR if you need assistance accessing your pay information.', 
'Employee compensation structure and pay procedures', true, false, CURRENT_DATE, 'staff', 1);

-- Insert some quiz questions for mandatory sections
INSERT INTO handbook_quiz_questions (section_id, question, question_type, correct_answer, explanation, sort_order) VALUES

((SELECT id FROM handbook_sections WHERE slug = 'welcome-message'), 
'What are HJS Services'' core values? (Select all that apply)', 'multiple_choice', 
'Integrity, Quality, Reliability, Respect, Growth, Safety', 
'Our six core values guide everything we do at HJS Services.', 1),

((SELECT id FROM handbook_sections WHERE slug = 'safety-protocols'), 
'When should you report unsafe conditions?', 'multiple_choice', 
'Immediately to your supervisor', 
'Safety is our top priority - unsafe conditions must be reported right away.', 1),

((SELECT id FROM handbook_sections WHERE slug = 'time-tracking'), 
'Overtime must be pre-approved by your supervisor.', 'true_false', 
'True', 
'All overtime work requires prior supervisor approval to manage labor costs and scheduling.', 1);

-- Insert quiz options for multiple choice questions
INSERT INTO handbook_quiz_options (question_id, option_text, is_correct, sort_order) VALUES

-- Core values question options
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Integrity', true, 1),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Quality', true, 2),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Reliability', true, 3),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Respect', true, 4),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Growth', true, 5),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Safety', true, 6),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'What are HJS Services%'), 'Profit', false, 7),

-- Safety reporting question options  
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'When should you report%'), 'At the end of your shift', false, 1),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'When should you report%'), 'During your next break', false, 2),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'When should you report%'), 'Immediately to your supervisor', true, 3),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'When should you report%'), 'Only if someone gets injured', false, 4),

-- Overtime question options
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'Overtime must be%'), 'True', true, 1),
((SELECT id FROM handbook_quiz_questions WHERE question LIKE 'Overtime must be%'), 'False', false, 2);

COMMENT ON TABLE handbook_sections IS 'Contains the actual HJS Services handbook content with proper versioning';
COMMENT ON TABLE handbook_quiz_questions IS 'Quiz questions to test employee understanding of policies';
COMMENT ON TABLE handbook_quiz_options IS 'Multiple choice options for handbook compliance quizzes';