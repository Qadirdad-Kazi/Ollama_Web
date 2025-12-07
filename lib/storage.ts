import connectDB from '@/lib/db';
import RegisteredModelModel, { IRegisteredModel } from '@/lib/models';

export interface RegisteredModel {
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

export async function getRegisteredModels(): Promise<RegisteredModel[]> {
    try {
        await connectDB();
        const models = await RegisteredModelModel.find({}).lean();

        // Map _id to string if needed, or just return the properties we care about
        return models.map((doc: any) => ({
            name: doc.name,
            baseUrl: doc.baseUrl,
            source: doc.source,
            apiKey: doc.apiKey,
            registeredAt: doc.registeredAt,
            status: doc.status,
            lastChecked: doc.lastChecked,
            size: doc.size,
            digest: doc.digest,
            modified_at: doc.modified_at
        }));
    } catch (error) {
        console.error('MongoDB Error:', error);
        return [];
    }
}

export async function saveRegisteredModels(models: RegisteredModel[]): Promise<void> {
    try {
        await connectDB();

        // This is a bit inefficient (delete all and insert), but safe for synchronization
        // Ideally we would upsert, but the current logic in the app passes the *entire* list every time.
        // So we should replace the collection with this new list.

        // However, to be safer and avoid downtime, we can iterate and upsert.
        // But the simplest mapping to the previous "save file" logic is "replace everything".

        // Let's try to be smart:
        // 1. Delete all remote models (since we are syncing the list)
        // Actually, the input `models` contains ALL registered models.

        // Transaction approach:
        // await RegisteredModelModel.deleteMany({});
        // await RegisteredModelModel.insertMany(models);

        // But wait, if we have multiple users, we might overwrite each other?
        // The current app logic is: read all -> append/update -> save all.
        // So it is already susceptible to race conditions.
        // Switching to Mongo doesn't fix the race condition in the calling code, but "delete all + insert" mimics the file overwrite.

        await RegisteredModelModel.deleteMany({});
        if (models.length > 0) {
            await RegisteredModelModel.insertMany(models);
        }

    } catch (error) {
        console.error('MongoDB Error:', error);
        throw error;
    }
}
