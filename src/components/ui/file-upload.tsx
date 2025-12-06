"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import { formatFileSize, MAX_FILES_PER_RECORD, ALLOWED_EXTENSIONS } from "@/lib/blob-config";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blobUrl: string;
}

interface FileUploadProps {
  recordType: "income" | "expense";
  recordId: string | null;
  attachments: Attachment[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled?: boolean;
}

export function FileUpload({
  recordType,
  recordId,
  attachments,
  onUpload,
  onDelete,
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (disabled || !recordId) return;

    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await handleFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const canAddMore = attachments.length < MAX_FILES_PER_RECORD;

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      {canAddMore && recordId && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${disabled || isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">กำลังอัพโหลด...</span>
            </div>
          ) : (
            <div
              className="cursor-pointer py-2"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                รองรับ: {ALLOWED_EXTENSIONS} (สูงสุด 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* No record ID message */}
      {!recordId && (
        <p className="text-sm text-muted-foreground text-center py-2 border border-dashed rounded-lg">
          บันทึกรายการก่อนเพิ่มไฟล์แนบ
        </p>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 bg-muted rounded-lg"
            >
              {/* Icon */}
              {isImage(attachment.mimeType) ? (
                <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(attachment.blobUrl, "_blank")}
                  title="ดูไฟล์"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                  title="ดาวน์โหลด"
                >
                  <a href={attachment.blobUrl} download={attachment.fileName}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={disabled || deletingId === attachment.id}
                  title="ลบ"
                >
                  {deletingId === attachment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File count */}
      <p className="text-xs text-muted-foreground text-right">
        {attachments.length}/{MAX_FILES_PER_RECORD} ไฟล์
      </p>
    </div>
  );
}
