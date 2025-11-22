--- ============================================================================
-- EMPLOYEE SCHEDULING SYSTEM (Type-aligned to your schema)
-- ============================================================================

-- 1. SHIFT TEMPLATES
CREATE TABLE IF NOT EXISTS shift_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  shift_type VARCHAR(50) NOT NULL, -- 'regular', 'split', 'on_call', 'overtime'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  days_of_week INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  regular_hours DECIMAL(5,2),
  overtime_multiplier DECIMAL(3,2) DEFAULT 1.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_shift_times CHECK (start_time < end_time OR shift_type = 'split')
);
CREATE INDEX IF NOT EXISTS idx_shift_templates_org ON shift_templates(organization_id);

-- 2. LOCATIONS
CREATE TABLE IF NOT EXISTS work_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  location_code VARCHAR(50),
  location_type VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  site_contact_name VARCHAR(200),
  site_contact_phone VARCHAR(20),
  site_contact_email VARCHAR(255),
  access_instructions TEXT,
  required_certifications TEXT[],
  special_requirements TEXT,
  billing_rate DECIMAL(10,2),
  contract_number VARCHAR(100),
  contract_start_date DATE,
  contract_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_state CHECK (state ~ '^[A-Z]{2}$')
);
CREATE INDEX IF NOT EXISTS idx_work_locations_org ON work_locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_locations_active ON work_locations(organization_id, is_active);

-- 3. EMPLOYEE SCHEDULE ASSIGNMENTS
CREATE TABLE IF NOT EXISTS employee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  shift_template_id UUID REFERENCES shift_templates(id) ON DELETE SET NULL,
  work_location_id UUID REFERENCES work_locations(id) ON DELETE SET NULL,
  start_time TIME,
  end_time TIME,
  break_duration_minutes INTEGER,
  supervisor_id UUID REFERENCES employees(id),
  team_id UUID, -- FK deferred until teams table exists
  status VARCHAR(50) DEFAULT 'scheduled',
  schedule_type VARCHAR(50) DEFAULT 'regular',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_employee_date UNIQUE(employee_id, schedule_date, shift_template_id)
);
CREATE INDEX IF NOT EXISTS idx_schedules_org ON employee_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_schedules_employee ON employee_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON employee_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedules_location ON employee_schedules(work_location_id);
CREATE INDEX IF NOT EXISTS idx_schedules_supervisor ON employee_schedules(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date_range ON employee_schedules(organization_id, schedule_date);

-- 4. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  team_code VARCHAR(50),
  team_type VARCHAR(50),
  team_lead_id UUID REFERENCES employees(id),
  supervisor_id UUID REFERENCES employees(id),
  primary_location_id UUID REFERENCES work_locations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_lead ON teams(team_lead_id);

-- 5. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_team_member UNIQUE(team_id, employee_id, start_date)
);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_employee ON team_members(employee_id);

-- 6. SCHEDULE MODIFICATIONS
CREATE TABLE IF NOT EXISTS schedule_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES employee_schedules(id) ON DELETE CASCADE,
  modification_type VARCHAR(50) NOT NULL,
  modification_date DATE NOT NULL,
  swap_employee_id UUID REFERENCES employees(id),
  request_reason TEXT,
  manager_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_modifications_org ON schedule_modifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_modifications_employee ON schedule_modifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_modifications_date ON schedule_modifications(modification_date);
CREATE INDEX IF NOT EXISTS idx_modifications_status ON schedule_modifications(status);

-- 7. EMPLOYEE TRAINING ASSIGNMENTS
CREATE TABLE IF NOT EXISTS training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  training_name VARCHAR(200) NOT NULL,
  training_type VARCHAR(50) NOT NULL,
  training_category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'assigned',
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completion_date DATE,
  expiration_date DATE,
  trainer_name VARCHAR(200),
  training_location VARCHAR(200),
  training_hours DECIMAL(5,2),
  certificate_number VARCHAR(100),
  certification_body VARCHAR(200),
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_training_org ON training_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_employee ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_training_expiration ON training_assignments(expiration_date) WHERE expiration_date IS NOT NULL;

-- 8. SCHEDULE TEMPLATES
CREATE TABLE IF NOT EXISTS schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template_type VARCHAR(50),
  cycle_length_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_schedule_templates_org ON schedule_templates(organization_id);

-- 9. SCHEDULE TEMPLATE DETAILS
CREATE TABLE IF NOT EXISTS schedule_template_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES schedule_templates(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  shift_template_id UUID REFERENCES shift_templates(id) ON DELETE CASCADE,
  work_location_id UUID REFERENCES work_locations(id),
  start_time TIME,
  end_time TIME,
  schedule_type VARCHAR(50) DEFAULT 'regular',
  CONSTRAINT valid_day_number CHECK (day_number > 0)
);
CREATE INDEX IF NOT EXISTS idx_template_details_template ON schedule_template_details(template_id);


-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_template_details ENABLE ROW LEVEL SECURITY;

-- Shift Templates
CREATE POLICY "Users can view shift templates in their org"
  ON shift_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage shift templates"
  ON shift_templates FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Work Locations
CREATE POLICY "Users can view work locations in their org"
  ON work_locations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage work locations"
  ON work_locations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Employee Schedules
CREATE POLICY "Users can view schedules in their org"
  ON employee_schedules FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage schedules"
  ON employee_schedules FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Teams
CREATE POLICY "Users can view teams in their org"
  ON teams FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Team Members
CREATE POLICY "Users can view team members in their org"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT id FROM teams WHERE organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
      )
    )
  );

-- Schedule Modifications
CREATE POLICY "Users can view modifications in their org"
  ON schedule_modifications FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can request modifications"
  ON schedule_modifications FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage modifications"
  ON schedule_modifications FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Training Assignments
CREATE POLICY "Users can view training in their org"
  ON training_assignments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage training"
  ON training_assignments FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Schedule Templates
CREATE POLICY "Users can view schedule templates in their org"
  ON schedule_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage schedule templates"
  ON schedule_templates FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
    )
  );

-- Schedule Template Details
CREATE POLICY "Users can view template details"
  ON schedule_template_details FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM schedule_templates WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage template details"
  ON schedule_template_details FOR ALL
  USING (
    template_id IN (
      SELECT id FROM schedule_templates WHERE organization_id IN (
        SELECT organization_id FROM user_organizations 
        WHERE user_id = auth.uid() AND role IN ('owner','admin','manager')
      )
    )
  );


-- ============================================================================
-- HELPER FUNCTIONS (unchanged types)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_days_in_month(target_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(DAY FROM (DATE_TRUNC('month', target_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_schedules_from_template(
  p_template_id UUID,
  p_employee_ids UUID[],
  p_start_date DATE,
  p_cycles INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_organization_id BIGINT;
  v_cycle_length INTEGER;
  v_records_created INTEGER := 0;
  v_employee_id UUID;
  v_detail RECORD;
  v_schedule_date DATE;
  cycle INTEGER;
BEGIN
  SELECT organization_id, cycle_length_days
  INTO v_organization_id, v_cycle_length
  FROM schedule_templates
  WHERE id = p_template_id;

  FOREACH v_employee_id IN ARRAY p_employee_ids LOOP
    FOR cycle IN 0..(p_cycles - 1) LOOP
      FOR v_detail IN 
        SELECT * FROM schedule_template_details 
        WHERE template_id = p_template_id
        ORDER BY day_number
      LOOP
        v_schedule_date := p_start_date + (cycle * v_cycle_length) + (v_detail.day_number - 1);
        IF v_detail.schedule_type != 'off' THEN
          INSERT INTO employee_schedules (
            organization_id, employee_id, schedule_date,
            shift_template_id, work_location_id, start_time, end_time,
            schedule_type, status
          ) VALUES (
            v_organization_id, v_employee_id, v_schedule_date,
            v_detail.shift_template_id, v_detail.work_location_id,
            v_detail.start_time, v_detail.end_time,
            v_detail.schedule_type, 'scheduled'
          )
          ON CONFLICT (employee_id, schedule_date, shift_template_id) DO NOTHING;
          v_records_created := v_records_created + 1;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_records_created;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SAMPLE DATA (id-aligned)
-- ============================================================================
DO $$
DECLARE
  v_org_id BIGINT;
  v_morning_shift UUID;
  v_location_1 UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations WHERE display_name ILIKE '%HJS Services%' OR legal_name ILIKE '%HJS Services%' LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    INSERT INTO shift_templates (organization_id, name, description, shift_type, start_time, end_time, break_duration_minutes, days_of_week)
    VALUES 
      (v_org_id, 'Morning Shift', 'Standard morning cleaning shift', 'regular', '06:00', '14:00', 30, ARRAY[1,2,3,4,5]),
      (v_org_id, 'Evening Shift', 'Evening cleaning shift', 'regular', '14:00', '22:00', 30, ARRAY[1,2,3,4,5]),
      (v_org_id, 'Night Shift', 'Overnight cleaning shift', 'regular', '22:00', '06:00', 30, ARRAY[1,2,3,4,5]),
      (v_org_id, 'Weekend Day', 'Weekend day shift', 'regular', '08:00', '16:00', 30, ARRAY[0,6])
    ON CONFLICT DO NOTHING;

    INSERT INTO work_locations (
      organization_id, name, location_code, location_type,
      address_line1, city, state, zip_code,
      site_contact_name, site_contact_phone,
      required_certifications, is_active
    ) VALUES (
      v_org_id, 'Federal Building - Atlanta', 'ATL-FB-001', 'government',
      '100 Alabama St SW', 'Atlanta', 'GA', '30303',
      'Building Manager', '404-555-0100',
      ARRAY['OSHA 30', 'Background Check'], true
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Sample scheduling data created for HJS Services LLC';
  END IF;
END $$;
