import mongoose, { Schema, Document } from 'mongoose';

export interface IRegisteredModel extends Document {
    name: string;
    baseUrl: string;
    source: 'remote' | 'local';
    apiKey?: string;
    registeredAt: string;
    status?: 'online' | 'offline';
    lastChecked?: string;
    size?: number;
    digest?: string;
    modified_at?: string;
}

const RegisteredModelSchema = new Schema<IRegisteredModel>({
    name: { type: String, required: true },
    baseUrl: { type: String, required: true },
    source: { type: String, enum: ['remote', 'local'], required: true },
    apiKey: { type: String },
    registeredAt: { type: String, required: true },
    status: { type: String, enum: ['online', 'offline'] },
    lastChecked: { type: String },
    size: { type: Number },
    digest: { type: String },
    modified_at: { type: String },
});

// Prevent overwriting the model if it's already compiled
export default mongoose.models.RegisteredModel || mongoose.model<IRegisteredModel>('RegisteredModel', RegisteredModelSchema);
