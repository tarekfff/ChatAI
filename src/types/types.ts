export interface FileAttachment {
    file: File;
    id: string;
    name: string;
    size: number;
    type: string;
}

// Search Result Types
export interface SearchResultFile {
    id: number;
    name: string;
    employee?: string;
    category?: string;
    type?: string;
    url?: string; // Made optional as it might be 'link' or 'webViewLink'
    link?: string;
    webViewLink?: string;
    webContentLink?: string;
    google_drive_link?: string;
    date?: string;
    similarity?: number;
}

export interface SearchResponse {
    type: 'search';
    success: boolean;
    found: boolean;
    count: number;
    message: string;
    avg_similarity: number;
    files: SearchResultFile[];
    searchCriteria?: Record<string, unknown>;
}

// Upload/File Exists Types
export interface ExistingFile {
    id: number;
    file_name: string;
    original_file_name: string;
    google_drive_web_view_link: string;
}

export interface UploadResponse {
    type: 'upload';
    success?: boolean; // Sometimes successful upload just has a message
    alreadyProcessed?: boolean;
    existingFile?: ExistingFile;
    message: string;
    file?: {
        name: string;
        type?: string;
        category?: string;
    };
    google_drive?: {
        link: string;
    };
    formatted_response?: string;
}

// Generated Document Types
export interface GeneratedDocument {
    id: number;
    name: string;
    content: string;
    summary?: string;
}

export interface DocumentResponse {
    type: 'document_generation';
    success: boolean;
    message: string;
    document: GeneratedDocument;
    formatted_response?: string;
}

export type MessageData = SearchResponse | UploadResponse | DocumentResponse | null;

export interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    files?: FileAttachment[];
    data?: MessageData;
}

export interface Conversation {
    id: string;
    session_id?: string; // Added session_id
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface APIResponse {
    success: boolean;
    message?: string;
    data?: unknown;
    error?: string;
}

// Backend Response Types
export interface BackendConversation {
    id: number;
    session_id: string;
    title: string;
    preview: string;
    message_count: number;
    file_count: number;
    last_activity: string;
    created_at: string;
    is_active: boolean;
}

export interface BackendMessage {
    role: 'user' | 'assistant';
    action?: string;
    content: string;
    timestamp: string;
    files?: Record<string, unknown>[];
    search_criteria?: Record<string, unknown>;
    found?: boolean;
    search_type?: string;
    results_count?: number;
    avg_similarity?: number;
    document_content?: string;
    file_info?: {
        name: string;
        type: string;
    };
}

