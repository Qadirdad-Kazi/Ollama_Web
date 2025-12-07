import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'registered-models.json');

export async function POST() {
    try {
        // 1. Read registered models
        let registeredModels: any[] = [];
        try {
            const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
            registeredModels = JSON.parse(fileContent);
        } catch (error) {
            return Response.json({ models: [] });
        }

        if (registeredModels.length === 0) {
            return Response.json({ models: [] });
        }

        // 2. Group by Base URL to avoid duplicate checks
        const uniqueUrls = [...new Set(registeredModels.map(m => m.baseUrl).filter(Boolean))];
        const urlStatus: Record<string, boolean> = {};

        // 3. Check each URL
        await Promise.all(uniqueUrls.map(async (url) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                // Find a model with this URL to get the API Key
                const modelWithKey = registeredModels.find(m => m.baseUrl === url && m.apiKey);
                const headers: Record<string, string> = {};
                if (modelWithKey?.apiKey) {
                    headers['Authorization'] = `Bearer ${modelWithKey.apiKey}`;
                }

                const response = await fetch(`${url}/api/tags`, {
                    method: 'GET',
                    headers,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                urlStatus[url as string] = response.ok;
            } catch (e) {
                urlStatus[url as string] = false;
            }
        }));

        // 4. Update models with new status
        const updatedModels = registeredModels.map(m => {
            if (m.source === 'remote' && m.baseUrl) {
                return {
                    ...m,
                    status: urlStatus[m.baseUrl] ? 'online' : 'offline',
                    lastChecked: new Date().toISOString()
                };
            }
            return m;
        });

        // 5. Save back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(updatedModels, null, 2));

        return Response.json({
            success: true,
            models: updatedModels
        });

    } catch (error) {
        console.error('Health check error:', error);
        return Response.json({ error: 'Failed to check model health' }, { status: 500 });
    }
}
