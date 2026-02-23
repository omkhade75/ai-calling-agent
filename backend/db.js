import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db.json');

let dbData = {
    users: [],
    assistants: [],
    otps: []
};

try {
    if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        if (raw) dbData = JSON.parse(raw);
    } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2));
    }
} catch (e) {
    console.error("Failed to load local DB", e);
}

function save() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2));
}

// Memory-based Models to replace Mongoose
export const User = {
    findOne: async (query) => dbData.users.find(u => Object.keys(query).every(k => u[k] === query[k])),
    create: async (data) => {
        const user = { _id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
        dbData.users.push(user);
        save();
        return user;
    }
};

export const VoiceAssistant = {
    find: async (query) => {
        let results = dbData.assistants.filter(a => Object.keys(query).every(k => a[k] === query[k]));
        return results.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    },
    findOne: async (query) => dbData.assistants.find(a => Object.keys(query).every(k => a[k] === query[k])),
    create: async (data) => {
        const ast = { _id: Date.now().toString(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        dbData.assistants.push(ast);
        save();
        return ast;
    },
    findOneAndUpdate: async (query, update, options) => {
        const idx = dbData.assistants.findIndex(a => Object.keys(query).every(k => a[k] === query[k]));
        if (idx === -1) return null;
        dbData.assistants[idx] = { ...dbData.assistants[idx], ...update, updatedAt: new Date().toISOString() };
        save();
        return dbData.assistants[idx];
    },
    findOneAndDelete: async (query) => {
        const idx = dbData.assistants.findIndex(a => Object.keys(query).every(k => a[k] === query[k]));
        if (idx === -1) return null;
        const deleted = dbData.assistants.splice(idx, 1)[0];
        save();
        return deleted;
    }
};

export const Otp = {
    findOne: async (query) => dbData.otps.find(o => Object.keys(query).every(k => o[k] === query[k])),
    create: async (data) => {
        const otp = { _id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
        dbData.otps.push(otp);
        save();
        return otp;
    },
    deleteOne: async (query) => {
        const idx = dbData.otps.findIndex(o => Object.keys(query).every(k => o[k] === query[k]));
        if (idx !== -1) {
            dbData.otps.splice(idx, 1);
            save();
        }
    }
};
