# AI Chat Application

## Introduction

Welcome to the AI Chat Application, a modern, responsive chat interface that allows you to interact with various AI language models powered by Ollama. This application provides a sleek, user-friendly interface for having natural conversations with AI, complete with features like message history, model selection, and a beautiful dark/light theme.

## 📸 Demo

### Light Theme
![Light Theme Interface](/Demo%20Images/1.png)

### Dark Theme
![Dark Theme Interface](/Demo%20Images/2.png)

## ✨ Key Features

- 💬 Real-time chat interface with streaming responses
- 🎨 Beautiful dark/light theme with smooth transitions
- 🔄 Support for multiple AI models (via Ollama)
- 📱 Responsive design that works on all devices
- 📋 Easy model switching and management
- 📝 Message history and conversation management
- ⚡ Built with Next.js 13+ and TypeScript
- 🎨 Styled with Tailwind CSS
- 🚀 Optimized for performance

## 🛠 Technologies Used

- **Frontend**:
  - Next.js 13+ (App Router)
  - TypeScript
  - React 18+
  - Tailwind CSS
  - Framer Motion (for animations)
  - Radix UI (for accessible components)
  - Lucide Icons

- **AI Integration**:
  - Ollama (local AI models)

- **Development Tools**:
  - Node.js
  - npm / yarn
  - ESLint
  - Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0.0 or later
- npm (comes with Node.js) or yarn
- Ollama installed and running locally

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-chat-app.git
   cd ai-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser and navigate to**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_BASE_URL` | Base URL for Ollama API | `http://localhost:11434` |

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🎨 Theming

The application supports both light and dark modes with a beautiful futuristic AI-inspired color palette. You can toggle between themes using the settings page.

### Customizing Themes

You can customize the theme colors by modifying the `tailwind.config.ts` file:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Your custom color palette
      primary: {
        DEFAULT: '#8B5CF6',
        light: '#A78BFA',
        dark: '#7C3AED',
      },
      // ... other theme customizations
    },
  },
}
```

## 🤖 Available AI Models

The application supports any model that can be run with Ollama. By default, it uses the following models:

- `llama3.2` - Meta's LLaMA 3.2B parameter model (default)
- [Add more models as needed]

To add a new model:

1. Pull the model using Ollama:
   ```bash
   ollama pull model-name
   ```
2. The model should automatically appear in the model selector dropdown.

## 🔌 API Endpoints

### Chat
- `POST /api/chat` - Send a message to the AI and get a streaming response
- `GET /api/models` - List all available Ollama models

## 🐛 Troubleshooting

### Common Issues

1. **Ollama not running**
   - Ensure Ollama is installed and running
   - Check that the `OLLAMA_BASE_URL` in your `.env.local` is correct

2. **No models available**
   - Make sure you've pulled at least one model with Ollama
   - Try refreshing the page after pulling a new model

3. **Connection issues**
   - Verify your internet connection
   - Check if Ollama is running on the correct port (default: 11434)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Ollama](https://ollama.ai/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Made with ❤️ by [Qadirdad-Kazi]
