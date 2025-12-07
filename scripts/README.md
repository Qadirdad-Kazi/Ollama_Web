# Automatic Model Registration

This utility allows you to register your local Ollama models with the central web application.
This is useful if you are running the web app in the cloud (e.g., Vercel) but want to use models running on your local machine (or another server).

## Prerequisites

- Node.js installed
- Ollama running locally (`http://localhost:11434`)
- If the web app is deployed to the cloud, you need a way to expose your local Ollama to the internet (e.g., [ngrok](https://ngrok.com/)).

## Usage

1. Run the script:
   ```bash
   node scripts/register-models.js
   ```

2. Follow the prompts:
   - **Web App URL**: The URL of your deployed web app (e.g., `https://my-ollama-web.vercel.app`).
   - **API Key**: The `OLLAMA_API_KEY` you set in your web app's environment variables (if any).
   - **Public URL**: The URL where *your* computer can be reached (e.g., your ngrok URL `https://xxxx.ngrok-free.app`).

## How it works

1. The script fetches the list of models from your local Ollama instance.
2. It sends this list to the web app's `/api/models/register` endpoint.
3. The web app saves these models and associates them with your Public URL.
4. When you select one of these models in the web app, the web app will send chat requests to your Public URL instead of its default backend.
