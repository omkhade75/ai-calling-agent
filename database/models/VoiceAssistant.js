import mongoose from 'mongoose';

const VoiceAssistantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    systemPrompt: { type: String, default: 'You are a helpful voice assistant.' },
    language: { type: String, default: 'en' },

    // Advanced config
    conversationMode: { type: String, default: 'neutral' },
    temperature: { type: Number, default: 0.7 },

    // Voice config
    voiceProvider: { type: String, default: 'elevenlabs' },
    voiceId: { type: String },
    voiceSpeed: { type: Number, default: 1.0 },

    // Tools & Transcriber config stored as mixed object
    tools: { type: mongoose.Schema.Types.Mixed, default: {} },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

VoiceAssistantSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.model('VoiceAssistant', VoiceAssistantSchema);
