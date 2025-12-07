import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'registered-models.json');

export async function POST(req: Request) {
    try {
        const { models, url, key, apiKey } = await req.json();

        // Basic security check (optional, but recommended)
        const serverKey = process.env.OLLAMA_API_KEY;
        if (serverKey && key !== serverKey) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!Array.isArray(models)) {
            return Response.json({ error: 'Invalid models format' }, { status: 400 });
        }

        // Read existing data
        let registeredModels: any[] = [];
        try {
            const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
            registeredModels = JSON.parse(fileContent);
        } catch (error) {
            // File might not exist yet, which is fine
        }

        // Merge/Update models
        // We'll add a 'source' field to distinguish them and 'baseUrl' to know where to call
        const newModels = models.map((m: any) => ({
            ...m,
            source: 'remote',
            baseUrl: url || null, // The URL where this model is hosted
            apiKey: apiKey || null, // The API Key needed to access this model
            registeredAt: new Date().toISOString(),
        }));

        // Filter out old models from the same URL if updating
        if (url) {
            registeredModels = registeredModels.filter((m: any) => m.baseUrl !== url);
        }

        registeredModels = [...registeredModels, ...newModels];

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(registeredModels, null, 2));

        return Response.json({ success: true, count: newModels.length });
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ error: 'Failed to register models' }, { status: 500 });
    }
}
