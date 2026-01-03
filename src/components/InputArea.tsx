'use client';

import React, { useRef, useState } from 'react';
import { Send, Paperclip, XCircle, Mic } from 'lucide-react';
import { FileAttachment } from '@/types/types';
import FilePreview from './FilePreview';

interface InputAreaProps {
    onSendMessage: (content: string, files: FileAttachment[]) => void;
    disabled?: boolean;
}

/**
 * InputArea component with auto-resizing textarea and file upload support
 */
const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false }) => {
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<FileAttachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if ((input.trim() || files.length > 0) && !disabled) {
            onSendMessage(input.trim(), files);
            setInput('');
            setFiles([]);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles: FileAttachment[] = selectedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
        }));
        setFiles(prev => [...prev, ...newFiles]);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };

    return (
        <div className="border-t border-[var(--border-color)] bg-[var(--chat-bg)] p-4">
            <div className="max-w-4xl mx-auto">
                {/* File previews */}
                {files.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {files.map(file => (
                            <FilePreview key={file.id} file={file} onRemove={handleRemoveFile} />
                        ))}
                    </div>
                )}

                {/* Input area */}
                <div className="flex items-center gap-3">
                    {/* File upload button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="p-3 rounded-xl bg-[var(--message-user)] hover:bg-[#3a3a3a] border border-[var(--border-color)] hover:border-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Attach file"
                    >
                        <Paperclip className="w-5 h-5 text-gray-300" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.csv,image/*"
                    />

                    {/* Textarea */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            placeholder="Send a message..."
                            rows={1}
                            className="w-full px-4 py-3 bg-[var(--message-user)] border border-[var(--border-color)] rounded-xl text-[var(--foreground)] placeholder-gray-500 resize-none focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed scrollbar-thin"
                            style={{ maxHeight: '200px' }}
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={disabled || (!input.trim() && files.length === 0)}
                        className={`p-3 rounded-xl transition-all ${input.trim() || files.length > 0
                            ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
                            : 'bg-[var(--message-user)] text-gray-500 cursor-not-allowed'
                            } disabled:opacity-50`}
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    );
};

export default InputArea;
