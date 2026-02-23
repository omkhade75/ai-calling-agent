import express from 'express';

const router = express.Router();

// POST /api/voice-chat — proxy to AI for voice conversation
router.post('/', async (req, res) => {
    try {
        const { userMessage, systemPrompt, temperature, conversationHistory } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: 'userMessage is required' });
        }

        const messages = [
            { role: 'system', content: systemPrompt || 'You are a helpful voice assistant. Keep responses concise and conversational.' },
            ...(conversationHistory || []),
            { role: 'user', content: userMessage },
        ];

        // Use OpenAI-compatible API — you can swap this with your own key / endpoint
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Fallback: simple echo response for testing
            return res.json({
                reply: `I heard you say: "${userMessage}". (Configure OPENAI_API_KEY in .env for real AI responses)`,
            });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages,
                temperature: temperature ?? 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";

        res.json({ reply });
    } catch (err) {
        console.error('Voice chat error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/tts', async (req, res) => {
    try {
        const { text, voiceId, voiceProvider } = req.body;

        if (!text) return res.status(400).json({ error: 'Text required' });

        // 1. OpenAI TTS
        if (voiceProvider === 'openai-tts') {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) return res.status(500).json({ error: 'OpenAI API Key missing' });

            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: voiceId || 'alloy',
                }),
            });

            if (!response.ok) throw new Error(`OpenAI TTS error: ${response.statusText}`);

            // Stream audio back
            const buffer = await response.arrayBuffer();
            res.set('Content-Type', 'audio/mpeg');
            res.send(Buffer.from(buffer));
            return;
        }

        // 2. ElevenLabs TTS with Fallback
        if (voiceProvider === 'elevenlabs') {
            const apiKey = process.env.ELEVENLABS_API_KEY;
            const voice = voiceId || 'JBFqnCBsd6RMkjVDRZzb';

            // If no ElevenLabs key, fallback to OpenAI if available
            if (!apiKey) {
                if (process.env.OPENAI_API_KEY) {
                    console.warn("[TTS] Missing ELEVENLABS_API_KEY, falling back to OpenAI TTS");
                    const oaKey = process.env.OPENAI_API_KEY;
                    const response = await fetch('https://api.openai.com/v1/audio/speech', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${oaKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'tts-1',
                            input: text,
                            voice: 'alloy', // Fallback voice
                        }),
                    });

                    if (!response.ok) throw new Error(`OpenAI TTS fallback error: ${response.statusText}`);
                    const buffer = await response.arrayBuffer();
                    res.set('Content-Type', 'audio/mpeg');
                    res.send(Buffer.from(buffer));
                    return;
                }
                return res.status(500).json({ error: 'ElevenLabs API Key missing (and no OpenAI fallback)' });
            }

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`ElevenLabs error: ${err}`);
            }

            const buffer = await response.arrayBuffer();
            res.set('Content-Type', 'audio/mpeg');
            res.send(Buffer.from(buffer));
            return;
        }

        // 3. Fallback / Unknown provider
        res.status(400).json({ error: 'Unsupported voice provider' });

    } catch (err) {
        console.error('TTS Error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
