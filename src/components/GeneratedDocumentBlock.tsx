import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { DocumentResponse } from '@/types/types';

interface GeneratedDocumentBlockProps {
    data: DocumentResponse;
}

const GeneratedDocumentBlock: React.FC<GeneratedDocumentBlockProps> = ({ data }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(data.document.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Simple markdown renderer for the document content
    const renderContent = (content: string) => {
        return content.split('\n').map((line, index) => {
            // Headers
            if (line.startsWith('# ')) {
                return <h1 key={index} className="text-xl font-bold mt-4 mb-2 text-white">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-lg font-bold mt-3 mb-2 text-white">{line.replace('## ', '')}</h2>;
            }

            // Bold text with **
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={index} className="min-h-[1.2em]">
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={i} className="text-gray-300">{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="mt-4 bg-[#1e1e1e] border border-gray-700/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">Generated Document</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Text</span>
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
                <div className="max-w-none text-right" dir="rtl">
                    {renderContent(data.document.content)}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800/30 px-4 py-2 text-xs text-gray-500 border-t border-gray-700/50 flex justify-between">
                <span>ID: {data.document.id}</span>
                {data.message && <span>{data.message}</span>}
            </div>
        </div>
    );
};

export default GeneratedDocumentBlock;
