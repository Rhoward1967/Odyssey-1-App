import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export interface DocumentVersion {
  id: string;
  bid_id: string;
  document_name: string;
  version_number: number;
  file_path: string;
  file_size: number;
  mime_type: string;
  changes_summary?: string;
  created_by: string;
  created_at: string;
  is_current: boolean;
}

export const useDocumentVersions = (bidId: string) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('bid_id', bidId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching document versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVersion = async (
    documentName: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
    changesSummary?: string
  ) => {
    setLoading(true);
    try {
      // Get current version number
      const { data: currentVersions } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('bid_id', bidId)
        .eq('document_name', documentName)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = (currentVersions?.[0]?.version_number || 0) + 1;

      // Mark all previous versions as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('bid_id', bidId)
        .eq('document_name', documentName);

      // Create new version
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          bid_id: bidId,
          document_name: documentName,
          version_number: nextVersion,
          file_path: filePath,
          file_size: fileSize,
          mime_type: mimeType,
          changes_summary: changesSummary,
          is_current: true
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchVersions();
      return data;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bidId) {
      fetchVersions();
    }
  }, [bidId]);

  return {
    versions,
    loading,
    createVersion,
    refetch: fetchVersions
  };
};