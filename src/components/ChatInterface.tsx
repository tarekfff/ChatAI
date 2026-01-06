'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Message, Conversation, FileAttachment, BackendConversation, BackendMessage } from '@/types/types';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import InputArea from './InputArea';

export default function ChatInterface() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isInitialLoad = React.useRef(true);

    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const fetchConversations = React.useCallback(async (specificId?: string) => {
        try {
            const response = await fetch('https://n8n.srv974225.hstgr.cloud/webhook/get-conversations');
            if (response.ok) {
                const text = await response.text();
                // Safe JSON parsing
                let data;
                try {
                    if (text) data = JSON.parse(text);
                } catch (e) {
                    console.warn('Invalid JSON from get-conversations', e);
                    return;
                }

                if (data && data.success && Array.isArray(data.conversations)) {
                    setConversations(prev => {
                        // Create a map for quick lookup of existing conversations
                        // We map by ID and Session ID to ensure we find matches even if ID changed
                        const existingMap = new Map();
                        prev.forEach(c => {
                            existingMap.set(c.id, c);
                            if (c.session_id) existingMap.set(c.session_id, c);
                        });

                        const mapped: Conversation[] = data.conversations.map((c: BackendConversation) => {
                            const backendId = c.id.toString();
                            // Try to find existing by ID or Session ID
                            const existing = existingMap.get(backendId) || (c.session_id ? existingMap.get(c.session_id) : null);

                            return {
                                id: backendId,
                                session_id: c.session_id,
                                title: c.title,
                                // Preserve existing messages if found, else empty
                                messages: existing ? existing.messages : [],
                                createdAt: new Date(c.created_at),
                                updatedAt: new Date(c.last_activity)
                            };
                        });

                        // If current conversation was "temporary" (local ID) and now we have a real one from backend,
                        // we might need to update currentConversationId if it got swapped. 
                        // But usually processMessage handles the ID swap. 
                        // If we are just listing, mapped list is safe.

                        // CRITICAL FIX: Preserve the currently active conversation if it's not in the backend list yet.
                        // This happens when creating a new chat; backend might be eventual consistent or slow to index,
                        // causing the new chat to disappear from the sidebar/view.

                        // Use specificId if provided (most accurate after a rename/save), otherwise fallback to current state
                        const idToPreserve = specificId || currentConversationId;

                        if (idToPreserve) {
                            const isPresent = mapped.some(c => c.id === idToPreserve);
                            if (!isPresent) {
                                // Try to find it in previous state
                                // Note: If specificId is new (real ID), it might not be in 'prev' with that ID if 'prev' still has Temp ID.
                                // BUT: setConversations update in processMessage typically happens BEFORE this fetch.
                                // So 'prev' here likely ALREADY has the swapped/real ID conversation inserted by processMessage.
                                const currentActive = prev.find(c => c.id === idToPreserve);
                                if (currentActive) {
                                    // Prepend it to keep it visible/active
                                    return [currentActive, ...mapped];
                                }
                            }
                        }

                        return mapped;
                    });

                    // Only select first if absolutely nothing selected AND it is the initial load
                    if (isInitialLoad.current) {
                        if (!currentConversationId && data.conversations.length > 0) {
                            setCurrentConversationId(data.conversations[0].id.toString());
                        }
                        isInitialLoad.current = false;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
            isInitialLoad.current = false; // Ensure we stop checking after first attempt even if failed
        }
    }, [currentConversationId]); // Added currentConversationId as it is used inside setConversations logic check but mainly we need it stable. Actually setConversations updater doesn't need it. 
    // Wait, line 69 uses currentConversationId. So we need it in deps or use ref.
    // Better: use setConversations callback fully or check currentConversationId ref. 
    // Simplify: just include it.

    // Load conversations from backend on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // ... loadConversationHistory ... (unchanged)

    // ... handleSendMessage ... (unchanged)

    // ... processMessage ... (start)



    // Load full history when a conversation is selected
    useEffect(() => {
        if (currentConversationId) {
            const conversation = conversations.find(c => c.id === currentConversationId);
            if (conversation && conversation.session_id && conversation.messages.length === 0) {
                loadConversationHistory(conversation.session_id, currentConversationId);
            }
        }
    }, [currentConversationId, conversations]); // Added conversations to dependency array to react to updates

    const loadConversationHistory = async (sessionId: string, conversationId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://n8n.srv974225.hstgr.cloud/webhook/98b211e8-1325-4867-a937-9bdaa0f140d2/get-conversation/${sessionId}`);
            if (response.ok) {
                const text = await response.text();
                if (!text) return; // Silent return if empty

                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.warn('Invalid JSON from get-conversation', e);
                    return;
                }

                if (data.success && Array.isArray(data.messages)) {
                    // Map backend messages to frontend format
                    const mappedMessages: Message[] = data.messages.map((msg: BackendMessage, index: number) => {
                        let messageData = null;

                        // Check if this message has special action/data
                        // Relaxed check: if action is search OR it has files populated
                        if (msg.action === 'semantic_search_results' || (msg.files && msg.files.length > 0)) {
                            messageData = {
                                type: 'search',
                                success: true,
                                found: true,
                                count: msg.results_count || msg.files?.length || 0,
                                message: msg.content,
                                avg_similarity: msg.avg_similarity || 0,
                                files: msg.files || [],
                                searchCriteria: msg.search_criteria
                            };
                        } else if (msg.action === 'document_generated' || (msg.document_content && msg.file_info)) {
                            messageData = {
                                type: 'document_generation',
                                action: 'document_generation',
                                success: true,
                                message: msg.content,
                                document: {
                                    title: msg.file_info?.name || "Generated Document",
                                    content: msg.document_content,
                                    type: msg.file_info?.type || "document",
                                    // Map other fields if needed, e.g. from file_info
                                }
                            };
                        }

                        return {
                            id: `hist-${index}-${Date.now()}`,
                            role: msg.role === 'assistant' ? 'ai' : 'user',
                            content: msg.content,
                            timestamp: new Date(msg.timestamp),
                            files: [], // Files in history usually handled via the message data for search results
                            data: messageData
                        };
                    });

                    setConversations(prev => prev.map(conv => {
                        if (conv.id === conversationId) {
                            return {
                                ...conv,
                                messages: mappedMessages
                            };
                        }
                        return conv;
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentMessages = (): Message[] => {
        const conversation = conversations.find(c => c.id === currentConversationId);
        return conversation ? conversation.messages : [];
    };

    const createNewConversation = () => {
        // For new conversation, we just reset the view. 
        // Real creation happens on first message.
        // We can temporarily add a placeholder in state or just null the ID.
        setCurrentConversationId(null);
    };

    const handleSendMessage = async (content: string, files: FileAttachment[]) => {
        let activeId = currentConversationId;
        let activeSessionId: string | undefined = undefined;

        if (!activeId) {
            const newId = Date.now().toString();
            // Generate a proper session ID immediately for the new conversation
            activeSessionId = `session-${generateUUID()}`;

            const newConv: Conversation = {
                id: newId,
                session_id: activeSessionId,
                title: content.slice(0, 30) || 'New Chat',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setConversations(prev => [newConv, ...prev]);
            activeId = newId;
            setCurrentConversationId(newId);
        }

        processMessage(activeId, content, files, activeSessionId);
    };

    const processMessage = async (conversationId: string, content: string, files: FileAttachment[], sessionIdOverride?: string) => {
        // Create user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            files
        };

        // Update conversation with user message
        setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
                return {
                    ...conv,
                    messages: [...conv.messages, userMessage],
                    title: conv.messages.length === 0 ? (content.slice(0, 30) + (content.length > 30 ? '...' : '')) : conv.title,
                    updatedAt: new Date()
                };
            }
            return conv;
        }));

        setIsLoading(true);

        let resultItem: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

        try {
            const formData = new FormData();
            files.forEach((fileAttachment) => {
                formData.append('files', fileAttachment.file);
            });
            formData.append('query', content);

            const currentConv = conversations.find(c => c.id === conversationId);
            // Use the override if provided (for new chats where state might not be updated yet), otherwise fallback to state
            const sessionIdToSend = sessionIdOverride || (currentConv ? currentConv.session_id : undefined);

            if (sessionIdToSend) {
                formData.append('session_id', sessionIdToSend);
                // Also Send user_id if needed, defaulted
                formData.append('user_id', 'anonymous');
            }

            const response = await fetch('https://n8n.srv974225.hstgr.cloud/webhook/auto-save-files', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const text = await response.text();
            let data: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
            try {
                if (text) data = JSON.parse(text);
            } catch (e) {
                console.warn("Empty or invalid JSON response from N8N", e);
            }

            // Determine response type and structure
            let aiContent = "Processed successfully.";
            let messageData = null;
            // lifted to outer scope for finally block

            // Normalize data: if array, use first item; else use data object
            resultItem = Array.isArray(data) ? data[0] : data;

            if (resultItem) {
                // Check for Search Response (Vector search often returns searchType='vector' and files array)
                if (resultItem.searchType === 'vector' || (resultItem.files && resultItem.files.length > 0)) {
                    messageData = {
                        type: 'search',
                        ...resultItem,
                        files: resultItem.files || []
                    };
                    aiContent = resultItem.message || "Here are the files I found matching your request.";
                }
                // Check for Document Generation
                else if (resultItem.action === 'document_generation' || resultItem.document) {
                    messageData = {
                        type: 'document_generation',
                        ...resultItem
                    };
                    aiContent = resultItem.message || "I have generated the document for you.";
                }
                // Check for "Already Processed" Upload
                else if (resultItem.alreadyProcessed) {
                    messageData = {
                        type: 'upload',
                        ...resultItem
                    };
                    aiContent = resultItem.message || "This file has already been processed.";
                }
                // Check for Standard Upload Success
                else if (resultItem.success && resultItem.file) {
                    messageData = {
                        type: 'upload',
                        ...resultItem
                    };
                    aiContent = resultItem.message || "File uploaded successfully.";
                }
                // Fallback generic message
                else if (resultItem.message) {
                    aiContent = resultItem.message;
                }
            }

            if (!text && !resultItem) {
                aiContent = "Request received, but no response content was returned.";
            }

            // Update session_id if returned
            if (resultItem && (resultItem.sessionId || resultItem.conversation?.session_id)) {
                const newSessionId = resultItem.sessionId || resultItem.conversation?.session_id;
                const newId = resultItem.conversation?.id ? resultItem.conversation.id.toString() : null;

                setConversations(prev => prev.map(conv => {
                    if (conv.id === conversationId) {
                        return {
                            ...conv,
                            session_id: newSessionId,
                            id: newId || conv.id
                        };
                    }
                    return conv;
                }));

                if (newId && conversationId !== newId) {
                    setCurrentConversationId(prev => (prev === conversationId ? newId : prev));
                }
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiContent,
                timestamp: new Date(),
                data: messageData
            };

            setConversations(prev => prev.map(conv => {
                // Use the potentially new ID if we just updated it, OR logic to sync
                // Since state update is async, 'conv.id' in this cycle might presumably still be old ID if mapped immediately?
                // No, we are inside a new SetState.
                // To be safe, we match either ID.
                const targetId = (resultItem?.conversation?.id && conversationId !== resultItem.conversation.id.toString())
                    ? resultItem.conversation.id.toString()
                    : conversationId;

                if (conv.id === targetId || conv.id === conversationId) {
                    return {
                        ...conv,
                        messages: [...conv.messages, aiMessage],
                        updatedAt: new Date()
                    };
                }
                return conv;
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "Sorry, I encountered an error communicating with the server. Please try again.",
                timestamp: new Date()
            };

            setConversations(prev => prev.map(conv => {
                if (conv.id === conversationId) {
                    return {
                        ...conv,
                        messages: [...conv.messages, errorMessage],
                        updatedAt: new Date()
                    };
                }
                return conv;
            }));
        } finally {
            setIsLoading(false);
            // Refresh conversation list to update titles/timestamps
            // Pass the correct ID (new real one or existing one) to ensure it is preserved if not yet in list
            const finalId = (resultItem?.conversation?.id && conversationId !== resultItem.conversation.id.toString())
                ? resultItem.conversation.id.toString()
                : conversationId;
            fetchConversations(finalId);
        }
    };

    const handleRenameConversation = async (id: string, newTitle: string) => {
        // Optimistic update
        setConversations(prev => prev.map(c =>
            c.id === id ? { ...c, title: newTitle } : c
        ));

        const conversation = conversations.find(c => c.id === id);
        if (conversation && conversation.session_id) {
            try {
                const response = await fetch(`https://n8n.srv974225.hstgr.cloud/webhook/98b211e8-1325-4867-a937-9bdaa0f140d2/rename-conversation/${conversation.session_id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: newTitle })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Conversation renamed successfully');
                } else {
                    alert(`Error: ${data.error || 'Failed to rename conversation'}`);
                    // Ideally revert optimistic update here
                }
            } catch (error) {
                console.error('Failed to rename conversation', error);
                alert('Error: Failed to rename conversation. Please check your connection.');
            }
        }
    };

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        const conversation = conversations.find(c => c.id === id);

        // Optimistic delete
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) {
            setCurrentConversationId(null);
        }

        if (conversation && conversation.session_id) {
            try {
                const response = await fetch(`https://n8n.srv974225.hstgr.cloud/webhook/98b211e8-1325-4867-a937-9bdaa0f140d2/delete-conversation/${conversation.session_id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (data.success) {
                    alert(data.message || 'Conversation deleted');
                } else {
                    alert(`Error: ${data.error || 'Failed to delete conversation'}`);
                    // Should revert state if failed
                }
            } catch (error) {
                console.error('Failed to delete conversation', error);
                alert('Error: Failed to delete conversation. Please check your connection.');
            }
        }
    };

    return (
        <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
            <Sidebar
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={setCurrentConversationId}
                onNewChat={createNewConversation}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-full relative w-full">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center p-4 border-b border-[var(--border-color)] bg-[var(--background)]">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-2 font-semibold">AI Assistant</span>
                </div>

                {/* Main Chat Area */}
                <MessageList
                    messages={getCurrentMessages()}
                    isLoading={isLoading}
                />

                {/* Input Area */}
                <InputArea
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}
