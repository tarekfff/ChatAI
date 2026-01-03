import React from 'react';
import { CheckCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { UploadResponse } from '@/types/types';

interface UploadStatusBlockProps {
    data: UploadResponse;
}

const UploadStatusBlock: React.FC<UploadStatusBlockProps> = ({ data }) => {
    // const isSuccess = data.success || data.formatted_response?.includes('✅'); // Unused

    const isAlreadyProcessed = data.alreadyProcessed;

    // Helper to extract file name if not directly provided
    const fileName = data.file?.name ||
        data.existingFile?.file_name ||
        (data.formatted_response?.match(/Msg: (.*?)\n/)?.[1]) ||
        "File";

    // Google Drive Link
    const driveLink = data.google_drive?.link || data.existingFile?.google_drive_web_view_link;

    if (isAlreadyProcessed) {
        return (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-200">File Already Exists</h4>
                        <p className="text-xs text-yellow-200/70 mt-1 mb-3">
                            {data.message || `The file "${fileName}" has already been processed.`}
                        </p>

                        {driveLink && (
                            <a
                                href={driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-medium bg-yellow-500/20 text-yellow-200 px-3 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Existing File
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-emerald-200 font-bold">Upload Successful</h4>
                    <p className="text-xs text-emerald-200/70 mt-1 mb-3">
                        {data.message}
                    </p>

                    <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <FileText className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-emerald-100 truncate">{fileName}</div>
                            {data.file?.category && (
                                <div className="text-xs text-emerald-500/70">{data.file.category}</div>
                            )}
                        </div>
                        {driveLink && (
                            <a
                                href={driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
                                title="Open in Drive"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadStatusBlock;
