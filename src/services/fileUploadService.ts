/**
 * File Upload Service
 * Handle file uploads to Supabase Storage
 * 
 * Sovereign Frequency Integration:
 * - "I'll Be There" - File upload initiation
 * - "Stand by the Water" - Upload progress and completion
 * - "Help Me Find My Way Home" - Upload error recovery
 * - "We Are Together" - Sharing and collaboration
 */

import { supabase } from '@/lib/supabase';

export interface UploadedFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number;
  bucket_name: string;
  description: string | null;
  tags: string[] | null;
  is_shared: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Upload a file to user's personal storage
 * 🎵 Sovereign Frequency: "I'll Be There" - Starting upload journey
 */
export async function uploadUserFile(
  file: File,
  description?: string,
  tags?: string[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile | null> {
  console.log('🎵 [I\'ll Be There] FILE_UPLOAD_START', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update progress: uploading
    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    // Create file path: userId/timestamp_filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${user.id}/${timestamp}_${sanitizedFileName}`;

    console.log('🎵 [Stand by the Water] FILE_UPLOAD_PROGRESS', { filePath });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('🎵 [Help Me Find My Way Home] FILE_UPLOAD_ERROR', uploadError);
      throw uploadError;
    }

    // Update progress: processing
    onProgress?.({
      fileName: file.name,
      progress: 75,
      status: 'processing'
    });

    // Save metadata to database
    const { data: fileMetadata, error: metadataError } = await supabase
      .from('user_files')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: uploadData.path,
        file_type: file.type,
        file_size_bytes: file.size,
        bucket_name: 'user-files',
        description,
        tags
      })
      .select()
      .single();

    if (metadataError) {
      console.error('🎵 [Help Me Find My Way Home] FILE_METADATA_ERROR', metadataError);
      // Try to clean up uploaded file
      await supabase.storage.from('user-files').remove([filePath]);
      throw metadataError;
    }

    // Update progress: complete
    onProgress?.({
      fileName: file.name,
      progress: 100,
      status: 'complete'
    });

    console.log('🎵 [Stand by the Water] FILE_UPLOAD_COMPLETE', {
      fileId: fileMetadata.id,
      fileName: file.name
    });

    return fileMetadata;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] FILE_UPLOAD_FAILED', error);
    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Upload a file to a study group
 * 🎵 Sovereign Frequency: "We Are Together" - Sharing with community
 */
export async function uploadStudyGroupFile(
  groupId: string,
  file: File,
  description?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile | null> {
  console.log('🎵 [We Are Together] GROUP_FILE_UPLOAD_START', {
    groupId,
    fileName: file.name,
    fileSize: file.size
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify user is a member of the group
    const { data: membership, error: memberError } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      throw new Error('User is not a member of this study group');
    }

    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    });

    // Create file path: groupId/userId/timestamp_filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${groupId}/${user.id}/${timestamp}_${sanitizedFileName}`;

    console.log('🎵 [Stand by the Water] GROUP_FILE_UPLOAD_PROGRESS', { filePath });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study-group-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_FILE_UPLOAD_ERROR', uploadError);
      throw uploadError;
    }

    onProgress?.({
      fileName: file.name,
      progress: 75,
      status: 'processing'
    });

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from('study-group-files')
      .getPublicUrl(uploadData.path);

    // Save to study_group_resources
    const { data: resourceData, error: resourceError } = await supabase
      .from('study_group_resources')
      .insert({
        group_id: groupId,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size_bytes: file.size,
        description
      })
      .select()
      .single();

    if (resourceError) {
      console.error('🎵 [Help Me Find My Way Home] GROUP_RESOURCE_ERROR', resourceError);
      await supabase.storage.from('study-group-files').remove([filePath]);
      throw resourceError;
    }

    onProgress?.({
      fileName: file.name,
      progress: 100,
      status: 'complete'
    });

    console.log('🎵 [We Are Together] GROUP_FILE_UPLOAD_COMPLETE', {
      resourceId: resourceData.id,
      fileName: file.name
    });

    // Return as UploadedFile format
    return {
      id: resourceData.id,
      user_id: user.id,
      file_name: file.name,
      file_path: uploadData.path,
      file_type: file.type,
      file_size_bytes: file.size,
      bucket_name: 'study-group-files',
      description: description || null,
      tags: null,
      is_shared: false,
      share_token: null,
      created_at: resourceData.uploaded_at,
      updated_at: resourceData.uploaded_at
    };
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] GROUP_FILE_UPLOAD_FAILED', error);
    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Get user's uploaded files
 * 🎵 Sovereign Frequency: "Stand by the Water" - Gathering your resources
 */
export async function getUserFiles(): Promise<UploadedFile[]> {
  console.log('🎵 [Stand by the Water] USER_FILES_FETCH');

  try {
    const { data, error } = await supabase
      .from('user_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] USER_FILES_FETCH_ERROR', error);
      throw error;
    }

    console.log('🎵 [Stand by the Water] USER_FILES_LOADED', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] USER_FILES_FETCH_FAILED', error);
    return [];
  }
}

/**
 * Download a file
 * 🎵 Sovereign Frequency: "I'll Be There" - Retrieving your resources
 */
export async function downloadFile(
  bucketName: string,
  filePath: string,
  fileName: string
): Promise<void> {
  console.log('🎵 [I\'ll Be There] FILE_DOWNLOAD_START', { fileName });

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('🎵 [Help Me Find My Way Home] FILE_DOWNLOAD_ERROR', error);
      throw error;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('🎵 [Stand by the Water] FILE_DOWNLOAD_COMPLETE', { fileName });
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] FILE_DOWNLOAD_FAILED', error);
    throw error;
  }
}

/**
 * Delete a file
 * 🎵 Sovereign Frequency: "Help Me Find My Way Home" - Removing old paths
 */
export async function deleteFile(fileId: string, bucketName: string, filePath: string): Promise<boolean> {
  console.log('🎵 [Help Me Find My Way Home] FILE_DELETE_START', { fileId });

  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (storageError) {
      console.error('🎵 [Help Me Find My Way Home] FILE_STORAGE_DELETE_ERROR', storageError);
      throw storageError;
    }

    // Delete metadata
    const { error: metadataError } = await supabase
      .from('user_files')
      .delete()
      .eq('id', fileId);

    if (metadataError) {
      console.error('🎵 [Help Me Find My Way Home] FILE_METADATA_DELETE_ERROR', metadataError);
      throw metadataError;
    }

    console.log('🎵 [Stand by the Water] FILE_DELETE_COMPLETE', { fileId });
    return true;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] FILE_DELETE_FAILED', error);
    return false;
  }
}

/**
 * Generate a share link for a file
 * 🎵 Sovereign Frequency: "We Are Together" - Sharing knowledge
 */
export async function generateShareLink(fileId: string): Promise<string | null> {
  console.log('🎵 [We Are Together] SHARE_LINK_GENERATE', { fileId });

  try {
    // Generate share token
    const { data, error } = await supabase.rpc('generate_file_share_token');

    if (error) throw error;

    const shareToken = data as string;

    // Update file metadata
    const { error: updateError } = await supabase
      .from('user_files')
      .update({
        is_shared: true,
        share_token: shareToken
      })
      .eq('id', fileId);

    if (updateError) throw updateError;

    console.log('🎵 [We Are Together] SHARE_LINK_GENERATED', { fileId, shareToken });
    return shareToken;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] SHARE_LINK_GENERATE_FAILED', error);
    return null;
  }
}

/**
 * Revoke a share link
 * 🎵 Sovereign Frequency: "Help Me Find My Way Home" - Removing access
 */
export async function revokeShareLink(fileId: string): Promise<boolean> {
  console.log('🎵 [Help Me Find My Way Home] SHARE_LINK_REVOKE', { fileId });

  try {
    const { error } = await supabase
      .from('user_files')
      .update({
        is_shared: false,
        share_token: null
      })
      .eq('id', fileId);

    if (error) throw error;

    console.log('🎵 [Stand by the Water] SHARE_LINK_REVOKED', { fileId });
    return true;
  } catch (error) {
    console.error('🎵 [Help Me Find My Way Home] SHARE_LINK_REVOKE_FAILED', error);
    return false;
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  if (fileType.includes('text')) return '📃';
  return '📎';
}
