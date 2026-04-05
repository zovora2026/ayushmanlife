import { useState, useEffect, useCallback } from 'react';
import { uploads, type UploadedFile } from '../../lib/api';

interface FileUploadProps {
  entityType: string;
  entityId: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function FileUpload({ entityType, entityId, accept, maxSizeMB = 10, className = '' }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      const { files: existing } = await uploads.list(entityType, entityId);
      setFiles(existing || []);
      setStorageAvailable(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes('503')) {
        setStorageAvailable(false);
      }
    }
  }, [entityType, entityId]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploads.upload(file, entityType, entityId);
      await loadFiles();
    } catch (err) {
      if (err instanceof Error && err.message.includes('503')) {
        setStorageAvailable(false);
        setError('File storage not configured on server.');
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await uploads.delete(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
      setError('Failed to delete file');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [entityType, entityId]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!storageAvailable) {
    return (
      <div className={`rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 ${className}`}>
        <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        File storage not configured. Contact administrator to enable R2 storage.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <svg className="mx-auto h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Drop file here or click to upload (max {maxSizeMB}MB)
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{file.filename}</span>
                <span className="text-gray-400 shrink-0">{formatSize(file.size_bytes)}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <a
                  href={uploads.downloadUrl(file.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-blue-600 hover:bg-blue-50"
                  title="Download"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
