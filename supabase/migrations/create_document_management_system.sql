-- Genesis Platform Document Management System
-- Secure infrastructure for compliance and HR document handling

-- 1. Create the Storage Bucket for document files
-- Storage is secured via RLS policies on the bucket itself
INSERT INTO storage.buckets (id, name, public)
VALUES ('odyssey_documents', 'odyssey_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the Metadata Table for tracking document records
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    file_name text NOT NULL,
    storage_path text NOT NULL UNIQUE,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    document_type text NOT NULL,
    tags text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Apply RLS to the Metadata Table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can manage their own documents within their organization
CREATE POLICY "Users can manage their own documents"
ON public.documents
FOR ALL
TO authenticated
USING (
    auth.uid() = user_id
    AND organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = (SELECT auth.uid()))
)
WITH CHECK (
    auth.uid() = user_id
    AND organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = (SELECT auth.uid()))
);

-- Admins/Owners can view all documents within their organization
CREATE POLICY "Admins/Owners can view all org documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id 
        FROM public.user_organizations 
        WHERE user_id = (SELECT auth.uid()) 
        AND role IN ('admin', 'owner')
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

COMMENT ON TABLE public.documents IS 'Genesis Platform Document Management - Secure metadata storage for compliance and HR documents';
