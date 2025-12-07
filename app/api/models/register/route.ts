import { getRegisteredModels, saveRegisteredModels, RegisteredModel } from '@/lib/storage';

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
        let registeredModels = await getRegisteredModels();

        // Merge/Update models
        const newModels: RegisteredModel[] = models.map((m: any) => ({
            ...m,
            source: 'remote',
            baseUrl: url || null, // The URL where this model is hosted
            apiKey: apiKey || null, // The API Key needed to access this model
            registeredAt: new Date().toISOString(),
        }));

        // Filter out old models from the same URL if updating
        if (url) {
            registeredModels = registeredModels.filter((m) => m.baseUrl !== url);
        }

        registeredModels = [...registeredModels, ...newModels];

        // Write back
        await saveRegisteredModels(registeredModels);

        return Response.json({ success: true, count: newModels.length });
    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ error: 'Failed to register models' }, { status: 500 });
    }
}
