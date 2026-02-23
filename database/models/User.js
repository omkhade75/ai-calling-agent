import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String },
    publicKey: { type: String },
    secretKey: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
