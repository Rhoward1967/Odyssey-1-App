import { supabase } from '@/lib/supabase';

export interface Document {
  id: string;
  organization_id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  document_type: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentParams {
  file: File;
  document_type: string;
  tags?: string[];
  organization_id: string;
}

// Genesis Platform DMS Actions - Secure document operations
export class DMSActions {
  
  // Upload document with metadata
  static async uploadDocument({ file, document_type, tags, organization_id }: UploadDocumentParams) {
    try {
      // Generate unique storage path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storage_path = `${organization_id}/${document_type}/${timestamp}_${sanitizedFileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('odyssey_documents')
        .upload(storage_path, file);

      if (uploadError) throw uploadError;

      // Create metadata record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          organization_id,
          file_name: file.name,
          storage_path,
          mime_type: file.type,
          size_bytes: file.size,
          document_type,
          tags: tags || []
        })
        .select()
        .single();

      if (documentError) throw documentError;

      return { success: true, document: documentData };
    } catch (error) {
      console.error('Document upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get documents by organization
  static async getDocuments(organization_id?: string, document_type?: string) {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      if (document_type) {
        query = query.eq('document_type', document_type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, documents: data };
    } catch (error) {
      console.error('Get documents error:', error);
      return { success: false, error: error.message };
    }
  }

  // Download document
  static async downloadDocument(storage_path: string) {
    try {
      const { data, error } = await supabase.storage
        .from('odyssey_documents')
        .download(storage_path);

      if (error) throw error;

      return { success: true, blob: data };
    } catch (error) {
      console.error('Document download error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete document
  static async deleteDocument(document_id: string) {
    try {
      // Get document metadata first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', document_id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('odyssey_documents')
        .remove([document.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document_id);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Document delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get document types for organization
  static async getDocumentTypes(organization_id: string) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('document_type')
        .eq('organization_id', organization_id);

      if (error) throw error;

      const uniqueTypes = [...new Set(data.map(d => d.document_type))];
      return { success: true, types: uniqueTypes };
    } catch (error) {
      console.error('Get document types error:', error);
      return { success: false, error: error.message };
    }
  }
}
