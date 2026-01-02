'use client';

import React from 'react';
import { MessageSquare, Trash2, Plus, Menu, X } from 'lucide-react';
import { Conversation } from '@/types/types';

interface SidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onDeleteConversation: (id: string, e: React.MouseEvent) => void;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Sidebar component for conversation history
 */
const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    isOpen,
    onClose
}) => {
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar container */}
            <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[260px] bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-full
      `}>
                {/* Header / New Chat */}
                <div className="p-3 border-b border-[var(--border-color)]">
                    <button
                        onClick={() => {
                            onNewChat();
                            if (window.innerWidth < 768) onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-[var(--border-color)] hover:bg-[var(--message-user)] transition-colors text-sm text-[var(--foreground)]"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New chat</span>
                    </button>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
                    {conversations.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-10">
                            No previous conversations
                        </div>
                    ) : (
                        <>
                            <div className="text-xs font-semibold text-gray-500 px-3 py-2">History</div>
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`
                    group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer
                    transition-colors text-sm overflow-hidden
                    ${currentConversationId === conv.id
                                            ? 'bg-[var(--message-user)] text-[var(--foreground)]'
                                            : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-[var(--foreground)]'}
                  `}
                                    onClick={() => {
                                        onSelectConversation(conv.id);
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                >
                                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate flex-1 pr-6">{conv.title}</span>

                                    {/* Delete button (visible on hover or active) */}
                                    <button
                                        onClick={(e) => onDeleteConversation(conv.id, e)}
                                        className={`
                      absolute right-2 p-1 rounded hover:bg-red-500/20 hover:text-red-400
                      transition-opacity
                      ${currentConversationId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                                        aria-label="Delete conversation"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Gradient fade for long titles */}
                                    <div className={`
                    absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l
                    ${currentConversationId === conv.id ? 'from-[var(--message-user)]' : 'from-[var(--sidebar-bg)] group-hover:from-[#2a2a2a]'}
                    to-transparent pointer-events-none
                  `} />
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* User profile / Settings area */}
                <div className="p-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--message-user)] cursor-pointer transition-colors text-sm text-[var(--foreground)]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs">
                            U
                        </div>
                        <div className="font-medium">User Account</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
