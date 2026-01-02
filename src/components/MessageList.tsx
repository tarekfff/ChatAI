'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

/**
 * MessageList component displays all messages with auto-scroll
 */
const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
            <div className="max-w-4xl mx-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl font-bold mb-6">
                            AI
                        </div>
                        <h1 className="text-3xl font-semibold text-gray-100 mb-3">
                            Welcome to AI Chat Assistant
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md">
                            Start a conversation by sending a message or uploading files
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex items-center gap-3 mb-6 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-semibold">
                                    AI
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default MessageList;
