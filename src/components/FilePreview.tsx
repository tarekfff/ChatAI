'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FileAttachment } from '@/types/types';

interface FilePreviewProps {
    file: FileAttachment;
    onRemove: (id: string) => void;
}

/**
 * FilePreview component displays uploaded file with size and remove button
 */
const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string): string => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('image')) return '🖼️';
        return '📎';
    };

    return (
        <div className="flex items-center gap-2 bg-[var(--message-user)] border border-[var(--border-color)] rounded-lg px-3 py-2 group hover:border-[var(--accent)] transition-colors">
            <span className="text-2xl">{getFileIcon(file.type)}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[var(--foreground)]">{file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
            </div>
            <button
                onClick={() => onRemove(file.id)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove file"
            >
                <X className="w-4 h-4 text-red-400" />
            </button>
        </div>
    );
};

export default FilePreview;
