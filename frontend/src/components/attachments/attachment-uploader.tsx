"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { attachmentsApi } from "@/lib/api/attachments";

interface AttachmentUploaderProps {
  defectId?: number;
  commentId?: number;
  disabled?: boolean;
  onUploaded?: () => void;
}

export function AttachmentUploader({ defectId, commentId, disabled, onUploaded }: AttachmentUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // reset selected files when target changes
    setFiles([]);
  }, [defectId, commentId]);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        await attachmentsApi.uploadAttachment(file, defectId, commentId);
      }
      setFiles([]);
      onUploaded?.();
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="uploader" className="text-base font-semibold">Добавить фотографии</Label>
        <Input
          id="uploader"
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || uploading}
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="cursor-pointer"
        />
      </div>
      {files.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">
              Выбрано: {files.length} {files.length === 1 ? 'файл' : 'файлов'}
            </span>
          </div>
          <Button onClick={handleUpload} disabled={disabled || uploading} size="sm">
            {uploading ? "Загрузка..." : "Загрузить"}
          </Button>
        </div>
      )}
    </div>
  );
}
