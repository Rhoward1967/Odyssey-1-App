-- Company Handbook Management System
-- This migration creates the database structure for storing and managing 
-- the HJS Services Employee Handbook with proper versioning and access control

-- Handbook Categories (main sections of the handbook)
CREATE TABLE handbook_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- Icon name for UI
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    required_role VARCHAR(50) DEFAULT 'staff', -- minimum role required to access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handbook Sections (individual policy documents within categories)
CREATE TABLE handbook_sections (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES handbook_categories(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT, -- Brief description for listings
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    is_mandatory BOOLEAN DEFAULT false, -- requires acknowledgment
    effective_date DATE,
    expiry_date DATE,
    required_role VARCHAR(50) DEFAULT 'staff',
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- Handbook Section History (version control)
CREATE TABLE handbook_section_history (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES handbook_sections(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL,
    change_summary TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Handbook Acknowledgments (compliance tracking)
CREATE TABLE handbook_acknowledgments (
    id SERIAL PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES handbook_sections(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    UNIQUE(employee_id, section_id)
);

-- Handbook Quiz Questions (for compliance testing)
CREATE TABLE handbook_quiz_questions (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES handbook_sections(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice', -- multiple_choice, true_false, text
    correct_answer TEXT,
    explanation TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handbook Quiz Options (for multiple choice questions)
CREATE TABLE handbook_quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES handbook_quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- Employee Quiz Results (compliance testing results)
CREATE TABLE handbook_quiz_results (
    id SERIAL PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES handbook_sections(id) ON DELETE CASCADE,
    score INTEGER NOT NULL, -- percentage score
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB -- store individual question answers
);

-- Handbook Downloads/Views (audit trail)
CREATE TABLE handbook_access_log (
    id SERIAL PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES handbook_sections(id) ON DELETE CASCADE,
    access_type VARCHAR(50) NOT NULL, -- 'view', 'download', 'print'
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_handbook_sections_category ON handbook_sections(category_id);
CREATE INDEX idx_handbook_sections_published ON handbook_sections(is_published);
CREATE INDEX idx_handbook_sections_mandatory ON handbook_sections(is_mandatory);
CREATE INDEX idx_handbook_acknowledgments_employee ON handbook_acknowledgments(employee_id);
CREATE INDEX idx_handbook_acknowledgments_section ON handbook_acknowledgments(section_id);
CREATE INDEX idx_handbook_access_log_employee ON handbook_access_log(employee_id);
CREATE INDEX idx_handbook_access_log_section ON handbook_access_log(section_id);
CREATE INDEX idx_handbook_quiz_results_employee ON handbook_quiz_results(employee_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_handbook_categories_updated_at 
    BEFORE UPDATE ON handbook_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_handbook_sections_updated_at 
    BEFORE UPDATE ON handbook_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for version history tracking
CREATE OR REPLACE FUNCTION track_handbook_section_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track changes to content or title
    IF OLD.title != NEW.title OR OLD.content != NEW.content THEN
        INSERT INTO handbook_section_history (
            section_id, title, content, version, change_summary, changed_by
        ) VALUES (
            OLD.id, OLD.title, OLD.content, OLD.version, 
            COALESCE(NEW.version::text, 'Content updated'), 
            NEW.created_by
        );
        
        -- Increment version number
        NEW.version = OLD.version + 1;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER track_handbook_section_changes_trigger
    BEFORE UPDATE ON handbook_sections
    FOR EACH ROW EXECUTE FUNCTION track_handbook_section_changes();

-- Insert initial handbook categories based on HJS Services structure
INSERT INTO handbook_categories (name, slug, description, icon, sort_order, required_role) VALUES
('Welcome & Company Overview', 'welcome-overview', 'Company mission, values, and organizational structure', 'Building2', 1, 'staff'),
('Employment Policies', 'employment-policies', 'Hiring, termination, and general employment guidelines', 'Users', 2, 'staff'),
('Workplace Standards', 'workplace-standards', 'Professional conduct, dress code, and behavior expectations', 'Shield', 3, 'staff'),
('Health & Safety', 'health-safety', 'Safety protocols, accident reporting, and health guidelines', 'Heart', 4, 'staff'),
('Time & Attendance', 'time-attendance', 'Work schedules, time tracking, and attendance policies', 'Clock', 5, 'staff'),
('Compensation & Benefits', 'compensation-benefits', 'Pay structure, benefits, and performance reviews', 'DollarSign', 6, 'staff'),
('Communication Guidelines', 'communication', 'Professional communication standards and protocols', 'MessageCircle', 7, 'staff'),
('Training & Development', 'training-development', 'Onboarding, continuing education, and skill development', 'BookOpen', 8, 'staff'),
('Client Relations', 'client-relations', 'Customer service standards and client interaction protocols', 'Handshake', 9, 'staff'),
('Technology & Equipment', 'technology-equipment', 'IT policies, equipment use, and digital security', 'Laptop', 10, 'staff'),
('Administrative Procedures', 'admin-procedures', 'Internal processes and administrative guidelines', 'FileText', 11, 'manager'),
('Management Resources', 'management-resources', 'Supervisor tools, reporting, and leadership guidelines', 'Crown', 12, 'manager');

COMMENT ON TABLE handbook_categories IS 'Main categories/sections of the employee handbook';
COMMENT ON TABLE handbook_sections IS 'Individual policy documents and handbook content';
COMMENT ON TABLE handbook_section_history IS 'Version control and change tracking for handbook content';
COMMENT ON TABLE handbook_acknowledgments IS 'Tracks when employees have read and acknowledged policies';
COMMENT ON TABLE handbook_quiz_questions IS 'Quiz questions for policy compliance testing';
COMMENT ON TABLE handbook_quiz_options IS 'Multiple choice options for quiz questions';
COMMENT ON TABLE handbook_quiz_results IS 'Results from employee compliance quizzes';
COMMENT ON TABLE handbook_access_log IS 'Audit log of handbook access for compliance reporting';