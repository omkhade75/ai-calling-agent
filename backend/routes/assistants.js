import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase admin client (uses SERVICE_ROLE key for backend)
function getSupabase() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    return createClient(url, key);
}

// ── Auth middleware: verifies Supabase JWT ──────────────────────────
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const supabase = getSupabase();
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });
        req.userId = user.id;
        req.userEmail = user.email;
        next();
    } catch {
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

// GET /api/assistants
router.get('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('voice_assistants')
            .select('*')
            .eq('user_id', req.userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/assistants
router.post('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('voice_assistants')
            .insert([{ user_id: req.userId, ...req.body, name: req.body.name || 'New Assistant' }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/assistants/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('voice_assistants')
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Assistant not found' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/assistants/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('voice_assistants')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
