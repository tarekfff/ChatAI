'use client';

import React from 'react';
import { Message, SearchResponse, UploadResponse, DocumentResponse } from '@/types/types';
import FilePreview from './FilePreview';
import SearchFilesBlock from './SearchFilesBlock';
import GeneratedDocumentBlock from './GeneratedDocumentBlock';
import UploadStatusBlock from './UploadStatusBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
interface MessageBubbleProps {
    message: Message;
}

/**
 * MessageBubble component displays individual messages with different styling for user and AI
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
            <div className={`max-w-[85%] ${isUser ? 'max-w-[70%]' : 'max-w-full'}`}>
                {/* Role label */}
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isUser
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        }`}>
                        {isUser ? 'U' : 'AI'}
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                        {isUser ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>

                {/* Message content */}
                <div className={`rounded-2xl px-5 py-4 ${isUser
                    ? 'bg-[var(--message-user)] ml-10'
                    : 'bg-transparent ml-10'
                    }`}>
                    {/* File attachments for user messages */}
                    {isUser && message.files && message.files.length > 0 && (
                        <div className="mb-3 space-y-2">
                            {message.files.map((file) => (
                                <div key={file.id} className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-lg">📎</span>
                                    <span className="truncate">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Message text */}
                    <div className={`text-[15px] leading-relaxed ${isUser ? 'text-gray-100' : 'text-gray-50'} ${!isUser ? 'text-lg' : ''}`}>
                        {isUser ? (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-4 border rounded-lg border-gray-700 bg-gray-800/30">
                                            <table className="min-w-full divide-y divide-gray-700" {...props} />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => (
                                        <thead className="bg-gray-800/80" {...props} />
                                    ),
                                    tbody: ({ node, ...props }) => (
                                        <tbody className="divide-y divide-gray-700 bg-gray-900/20" {...props} />
                                    ),
                                    tr: ({ node, ...props }) => (
                                        <tr className="hover:bg-gray-700/30 transition-colors" {...props} />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase tracking-wider border-b border-gray-600" {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td className="px-4 py-3 whitespace-normal text-sm text-gray-300" {...props} />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="mb-3 last:mb-0 leading-7" {...props} />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a className="text-blue-400 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
                                    ),
                                    code: ({ node, className, children, ...props }: any) => {
                                        const match = /language-(\w+)/.exec(className || '')
                                        const isInline = !match && !String(children).includes('\n')
                                        return isInline ? (
                                            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <div className="relative my-4 rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-700">
                                                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                                                    <span className="text-xs text-gray-400 font-mono">{match?.[1] || 'code'}</span>
                                                </div>
                                                <div className="overflow-x-auto p-4">
                                                    <code className={`font-mono text-sm ${className}`} {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            </div>
                                        )
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>

                    {/* Rich Response Blocks */}
                    {!isUser && message.data && (
                        <div className="mt-2">
                            {/* Search Results */}
                            {message.data.type === 'search' && (
                                <SearchFilesBlock data={message.data as SearchResponse} />
                            )}

                            {/* Generated Document */}
                            {message.data.type === 'document_generation' && (
                                <GeneratedDocumentBlock data={message.data as DocumentResponse} />
                            )}

                            {/* Upload Status */}
                            {message.data.type === 'upload' && (
                                <UploadStatusBlock data={message.data as UploadResponse} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
