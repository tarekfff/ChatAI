'use client';

import React from 'react';
import { Message, SearchResponse, UploadResponse, DocumentResponse } from '@/types/types';
import FilePreview from './FilePreview';
import SearchFilesBlock from './SearchFilesBlock';
import GeneratedDocumentBlock from './GeneratedDocumentBlock';
import UploadStatusBlock from './UploadStatusBlock';

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
                    <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isUser ? 'text-gray-100' : 'text-gray-50'
                        } ${!isUser ? 'text-lg' : ''}`}>
                        {message.content}
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
