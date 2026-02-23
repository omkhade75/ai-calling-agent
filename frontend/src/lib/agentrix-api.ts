import { apiFetch } from "@/lib/api";

// ---------- Voice Assistants ----------
export const assistants = {
    async list() {
        return apiFetch('/assistants');
    },

    async create(data: any) {
        return apiFetch('/assistants', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: any) {
        return apiFetch(`/assistants/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async remove(id: string) {
        return apiFetch(`/assistants/${id}`, { method: 'DELETE' });
    },
};

// ---------- Voice Chat ----------
export const voiceChat = {
    async invoke(body: {
        userMessage: string;
        systemPrompt?: string;
        temperature?: number;
        conversationHistory?: any[];
    }) {
        return apiFetch<{ reply: string }>('/voice-chat', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
};
