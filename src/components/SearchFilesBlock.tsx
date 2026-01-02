import React from 'react';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { SearchResponse, SearchResultFile } from '@/types/types';

interface SearchFilesBlockProps {
    data: SearchResponse;
}

// Helper to extract Drive ID and create download link
const getDownloadLink = (url: string) => {
    if (!url) return '';
    try {
        const idMatch = url.match(/\/d\/(.*?)\//);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
    } catch (e) {
        console.error('Error parsing Drive URL', e);
    }
    return url; // Fallback to original URL
};

const GoogleDriveIcon = () => (
    <svg viewBox="0 0 87.3 78" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
        <path d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2l-13.75 23.8z" fill="#00ac47" />
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 11.1-19.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
        <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-20 34.6c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00832d" />
        <path d="M73.55 76.8L59.8 52.95L46.05 29.15 29.9 57.1l-6.95 12.05 6.2 10.75c.8 1.4 1.95 2.5 3.3 3.3z" fill="#2684fc" />
        <path d="M79.25 29.15l-13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-6.25l13.75 23.8z" fill="#ffba00" />
    </svg>
);

// Helper to try multiple fields for the URL
const getFileUrl = (file: any): string | undefined => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Check all possible field names from different backend response formats
    return file.url ||
        file.link ||
        file.webViewLink ||
        file.webContentLink ||
        file.google_drive_web_view_link ||
        file.google_drive_link ||
        file.alternateLink ||
        file.embedLink;
};

const SearchFilesBlock: React.FC<SearchFilesBlockProps> = ({ data }) => {
    return (
        <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Found {data.count} similar files</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Avg Similarity:</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                        {(data.avg_similarity * 1).toFixed(0)}%
                    </span>
                </div>
            </div>

            <div className="grid gap-3">
                {data.files.map((file, index) => (
                    <div
                        key={`${file.id}-${index}`}
                        className="bg-[#1e1e1e] border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <GoogleDriveIcon />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-200 truncate pr-2" title={file.name}>
                                    {file.name}
                                </h4>

                                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2 text-xs text-gray-400">
                                    {file.category && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            {file.category}
                                        </span>
                                    )}
                                    {file.type && (
                                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">
                                            {file.type}
                                        </span>
                                    )}
                                </div>

                                {file.similarity && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-1.5 flex-1 bg-gray-700/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                style={{ width: `${file.similarity}%` }} // Adjusted: assuming api returns 0-100 based on json example
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-emerald-400">
                                            {file.similarity}% Match
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700/30">
                            {(() => {
                                const fileUrl = getFileUrl(file);
                                return fileUrl ? (
                                    <>
                                        <a
                                            href={getDownloadLink(fileUrl)}
                                            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg transition-colors group/btn"
                                        >
                                            <Download className="w-3.5 h-3.5 group-hover/btn:text-white" />
                                            <span>Download</span>
                                        </a>
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-lg transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Open in Drive</span>
                                        </a>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-500 italic w-full text-center">
                                        No link available
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchFilesBlock;
