
const fs = require('fs');
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin.isTTY ? process.stdin : require('fs').createReadStream('/dev/tty'),
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function fetchLocalModels() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:11434/api/tags', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function registerModels() {
    console.log('=== Automatic Model Registration ===');
    console.log('This utility will register your local Ollama models with the central web app.');

    try {
        // 1. Get Web App URL
        const webAppUrl = await question('Enter the Web App URL (e.g., https://my-app.vercel.app): ');
        if (!webAppUrl) {
            console.error('Web App URL is required.');
            process.exit(1);
        }
        const cleanWebAppUrl = webAppUrl.replace(/\/$/, '');

        // 2. Get API Key
        const apiKey = await question('Enter the API Key (if configured on server): ');

        // 3. Get Public URL for this machine
        console.log('\nThe web app needs to know how to reach THIS machine.');
        console.log('If you are running this script on the same machine as the web app, you can leave this blank.');
        console.log('If the web app is deployed (e.g. Vercel), you MUST provide a public URL (e.g. ngrok URL).');
        const publicUrl = await question('Enter your Public URL (e.g., https://1234.ngrok.io): ');

        // 4. Get Model API Key (Optional)
        console.log('\nIf your local API is protected by a key (e.g. OLLAMA_API_KEY), enter it here.');
        const modelApiKey = await question('Enter Model API Key (optional): ');

        // 5. Fetch Local Models
        console.log('\nFetching local models from http://localhost:11434...');
        const localData = await fetchLocalModels();
        const models = localData.models || [];
        console.log(`Found ${models.length} models: `, models.map(m => m.name).join(', '));

        if (models.length === 0) {
            console.log('No models found. Please run "ollama pull <model>" first.');
            process.exit(0);
        }

        // 5. Register
        console.log(`\nRegistering models with ${cleanWebAppUrl}...`);

        const payload = {
            models: models,
            url: publicUrl || null,
            key: apiKey,
            apiKey: modelApiKey
        };

        const response = await fetch(`${cleanWebAppUrl} /api/models / register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Success! Registered models:', result.count);
        } else {
            console.error('❌ Failed to register:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response:', text);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
    }
}

registerModels();
