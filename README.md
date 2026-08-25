<div align="center">

# Ollama Web

### A polished web interface for chatting with AI models through Ollama

Chat privately with locally hosted models—or connect to an Ollama-compatible endpoint you control. Ollama Web combines streaming responses, model management, chat organization, and a responsive light/dark interface in one modern Next.js application.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/Powered_by-Ollama-FFFFFF?style=for-the-badge&logo=ollama&logoColor=black)](https://ollama.com/)

[**Try the live demo**](https://ollama-web-tau.vercel.app/) · [**Report a bug**](https://github.com/ninjacreativity/Ollama_Web/issues) · [**Request a feature**](https://github.com/ninjacreativity/Ollama_Web/issues)

</div>

## Preview

| Chat workspace | Model settings |
| --- | --- |
| ![Ollama Web chat workspace](./Demo%20Images/1.png) | ![Ollama Web model settings](./Demo%20Images/2.png) |

## Why Ollama Web?

Ollama is excellent for running language models on your own hardware. Ollama Web adds the interface around it: a focused chat experience, fast model switching, live response streaming, model controls, connection health, and theme preferences.

Your inference endpoint remains under your control—run the app and Ollama on the same machine, connect through the server, or use the experimental direct-browser mode.

## Features

- **Streaming conversations** — see responses as Ollama generates them.
- **Automatic model discovery** — load installed models from your configured Ollama instance.
- **Fast model switching** — move between available models from the chat header.
- **Model management** — view model details and pull or delete models from Settings.
- **Conversation workspace** — create, switch between, and delete chats during the current session.
- **Two connection modes** — use the Next.js server as a proxy or connect the browser directly to local Ollama.
- **Connection visibility** — check service status, base URL, and Ollama version.
- **Adaptive appearance** — light, dark, and system theme support.
- **Responsive UI** — designed for desktop and smaller screens.
- **Custom inference support** — includes a Python API example that follows Ollama-compatible endpoints.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 with App Router |
| UI | React 19, TypeScript, Tailwind CSS |
| Components | Radix UI, Lucide React |
| Motion | Framer Motion |
| AI runtime | Ollama |
| Optional storage | MongoDB with Mongoose |

## Getting Started

### Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) 20.9 or newer
- [Ollama](https://ollama.com/download) installed and running
- At least one Ollama model installed

### 1. Clone the repository

```bash
git clone https://github.com/ninjacreativity/Ollama_Web.git
cd Ollama_Web
```

### 2. Install dependencies

```bash
npm install
```

If npm reports a peer-dependency conflict, use the same install mode as the included Vercel configuration:

```bash
npm install --legacy-peer-deps
```

### 3. Configure the environment

Copy the example environment file:

```bash
cp env.example .env.local
```

For a standard local setup, `.env.local` only needs:

```env
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Start Ollama and install a model

```bash
ollama serve
```

In another terminal, pull a model if you do not already have one:

```bash
ollama pull llama3.2
```

### 5. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select an installed model.

## Connection Modes

Ollama Web includes two ways to reach Ollama. You can switch modes from the Settings page.

| Mode | How it works | Best for |
| --- | --- | --- |
| **Server** | The browser calls `/api/chat`, and the Next.js server forwards requests to `OLLAMA_BASE_URL`. | Default local development and hosted Ollama endpoints |
| **Local (experimental)** | The browser calls `http://localhost:11434` directly. | Using a deployed UI with Ollama running on the same computer as the browser |

Direct-browser mode requires Ollama to accept requests from the web app's origin. Review your Ollama origin settings carefully and avoid broad origin access on untrusted networks.

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama or Ollama-compatible API used by the Next.js server |
| `OLLAMA_API_KEY` | No | — | Bearer key for a protected inference endpoint and optional registration protection |
| `MONGODB_URI` | Only for registered remote models | — | MongoDB connection used by the remote-model registration flow |

Keep secrets in `.env.local`; never commit that file.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Create a production build |
| `npm start` | Run the production server |
| `npm run lint` | Run the configured Next.js lint command |

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/chat` | Forward a chat request and stream the generated response |
| `GET` | `/api/models` | List available models and Ollama system information |
| `POST` | `/api/models/pull` | Pull a model through Ollama |
| `POST` | `/api/models/delete` | Delete an installed model |
| `GET` | `/api/health` | Check whether the configured Ollama service is available |
| `POST` | `/api/models/register` | Register models exposed by another Ollama-compatible host |

## Custom Python API

The repository includes a small FastAPI example for connecting a custom inference backend that exposes Ollama-compatible routes:

```bash
cd scripts/python-api-example
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then point the web app to it:

```env
OLLAMA_BASE_URL=http://localhost:8000
```

See [`scripts/python-api-example/README.md`](./scripts/python-api-example/README.md) for the full example.

## Troubleshooting

### No models appear

Confirm Ollama is running and that at least one model is installed:

```bash
ollama list
ollama pull llama3.2
```

### The app cannot reach Ollama

Check the configured endpoint directly:

```bash
curl http://localhost:11434/api/tags
```

If that request fails, start Ollama with `ollama serve` and verify `OLLAMA_BASE_URL`.

### A deployed app cannot reach local Ollama

`localhost` on a cloud deployment refers to the cloud host, not your computer. Use an accessible, protected Ollama endpoint or switch the app to local browser mode.

### Direct-browser mode is blocked

The browser enforces cross-origin rules. Configure Ollama to allow the exact origin of your web app, then restart Ollama. Avoid wildcard origins outside a trusted development environment.

## Project Structure

```text
Ollama_Web/
├── app/                  # Pages and API route handlers
│   ├── api/              # Chat, model, and health endpoints
│   ├── models/           # Model overview page
│   └── settings/         # Connection, appearance, and model settings
├── components/           # Application and reusable UI components
├── hooks/                # Chat, responsive, and Ollama-mode hooks
├── lib/                  # Database, storage, and Ollama helpers
├── public/               # Static assets and registration utility
├── scripts/              # Supporting documentation and Python API example
└── Demo Images/          # Repository screenshots
```

## Deployment

The project includes configuration for both Vercel and Netlify.

Use Node.js 20.9 or newer in the deployment environment. If using Netlify, update any older Node runtime value in `netlify.toml` before building.

Before deploying, remember that `localhost:11434` on a cloud host does **not** point to Ollama on your personal computer. Your deployment must either:

- reach an Ollama instance running on an accessible server;
- run beside Ollama on the same host or private network; or
- use local browser mode to connect to Ollama on the visitor's computer.

For remote access, protect the Ollama-compatible endpoint, use HTTPS, and configure `OLLAMA_API_KEY` when the endpoint supports bearer authentication.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit your work: `git commit -m "Add your feature"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a pull request describing the change and how you tested it.

## Acknowledgements

Built with [Ollama](https://ollama.com/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), and [Framer Motion](https://www.framer.com/motion/).

<div align="center">

Built by [Qadirdad Kazi](https://github.com/Qadirdad-Kazi) · Maintained by [Ninja Creativity](https://github.com/ninjacreativity)

If Ollama Web helps you, consider giving the repository a ⭐

</div>
