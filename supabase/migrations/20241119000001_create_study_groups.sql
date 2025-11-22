-- Study Groups System
-- Educational collaboration platform for Media Center

-- Study Groups Table
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    portal_type TEXT NOT NULL CHECK (portal_type IN ('k12', 'legal', 'medical', 'college')),
    max_members INTEGER DEFAULT 10 CHECK (max_members > 0 AND max_members <= 50),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    meeting_schedule TEXT, -- e.g., "Mon/Wed 7pm EST"
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_study_groups_portal_type ON study_groups(portal_type);
CREATE INDEX idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX idx_study_groups_subject ON study_groups(subject);
CREATE INDEX idx_study_groups_active ON study_groups(is_active);

-- Study Group Members Table
CREATE TABLE IF NOT EXISTS study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('creator', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_study_group_members_role ON study_group_members(role);

-- Study Group Messages Table
CREATE TABLE IF NOT EXISTS study_group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_study_group_messages_group ON study_group_messages(group_id, created_at DESC);
CREATE INDEX idx_study_group_messages_user ON study_group_messages(user_id);

-- Study Group Resources Table
CREATE TABLE IF NOT EXISTS study_group_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes BIGINT,
    description TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    download_count INTEGER DEFAULT 0
);

CREATE INDEX idx_study_group_resources_group ON study_group_resources(group_id);
CREATE INDEX idx_study_group_resources_uploader ON study_group_resources(uploaded_by);

-- RLS Policies

-- Study Groups: Anyone authenticated can view active groups, only creators can update/delete
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active study groups"
    ON study_groups FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

CREATE POLICY "Authenticated users can create study groups"
    ON study_groups FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their study groups"
    ON study_groups FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their study groups"
    ON study_groups FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Study Group Members: Members can view their groups, users can join, creators/moderators can manage
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their group membership"
    ON study_group_members FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        group_id IN (
            SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join study groups"
    ON study_group_members FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        -- Check group is not full
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = study_group_members.group_id) < 
        (SELECT max_members FROM study_groups WHERE id = study_group_members.group_id)
    );

CREATE POLICY "Users can leave study groups"
    ON study_group_members FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Moderators can remove members"
    ON study_group_members FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM study_group_members m
            WHERE m.group_id = study_group_members.group_id
            AND m.user_id = auth.uid()
            AND m.role IN ('creator', 'moderator')
        )
    );

-- Study Group Messages: Members can read/write messages in their groups
ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group messages"
    ON study_group_messages FOR SELECT
    TO authenticated
    USING (
        group_id IN (
            SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Members can send messages"
    ON study_group_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        group_id IN (
            SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can edit their own messages"
    ON study_group_messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
    ON study_group_messages FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Study Group Resources: Members can view/upload, uploaders can delete
ALTER TABLE study_group_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group resources"
    ON study_group_resources FOR SELECT
    TO authenticated
    USING (
        group_id IN (
            SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Members can upload resources"
    ON study_group_resources FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = uploaded_by AND
        group_id IN (
            SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Uploaders can delete their resources"
    ON study_group_resources FOR DELETE
    TO authenticated
    USING (auth.uid() = uploaded_by);

CREATE POLICY "Moderators can delete any resource"
    ON study_group_resources FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM study_group_members m
            WHERE m.group_id = study_group_resources.group_id
            AND m.user_id = auth.uid()
            AND m.role IN ('creator', 'moderator')
        )
    );

-- Helper Function: Get group member count
CREATE OR REPLACE FUNCTION get_study_group_member_count(group_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM study_group_members WHERE group_id = group_uuid);
END;
$$;

-- Helper Function: Check if user is group member
CREATE OR REPLACE FUNCTION is_study_group_member(group_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM study_group_members 
        WHERE group_id = group_uuid AND user_id = user_uuid
    );
END;
$$;

-- Trigger: Update last_active_at on message send
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE study_group_members
    SET last_active_at = NOW()
    WHERE group_id = NEW.group_id AND user_id = NEW.user_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_member_last_active
AFTER INSERT ON study_group_messages
FOR EACH ROW
EXECUTE FUNCTION update_member_last_active();

-- Trigger: Increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- This would be called from the application when a file is downloaded
    RETURN NEW;
END;
$$;

COMMENT ON TABLE study_groups IS 'Educational study groups for collaborative learning';
COMMENT ON TABLE study_group_members IS 'Membership records for study groups';
COMMENT ON TABLE study_group_messages IS 'Chat messages within study groups';
COMMENT ON TABLE study_group_resources IS 'Shared files and resources within study groups';
