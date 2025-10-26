# 🚀 Deployment Guide

This guide will help you deploy your Ollama Web application to production.

## 📋 Prerequisites

Before deploying, you need:

1. **A Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **A Hosted Ollama Instance** - Since Ollama needs to run on a server, you have several options:
   - Deploy Ollama on a VPS (DigitalOcean, AWS EC2, etc.)
   - Use Railway, Fly.io, or similar platforms
   - Run Ollama on your own server with a public URL

## 🌐 Deploying to Vercel (Recommended)

Vercel is the best platform for Next.js applications and handles both frontend and API routes seamlessly.

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Configure your project:
     - Framework Preset: Next.js (auto-detected)
     - Root Directory: `./`
     - Build Command: `npm run build` (default)
     - Output Directory: `.next` (default)

3. **Add Environment Variables**
   In the Vercel dashboard, add:
   ```
   OLLAMA_BASE_URL=https://your-ollama-instance.com
   ```
   Replace with your actual Ollama URL.

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Add Environment Variable**
   ```bash
   vercel env add OLLAMA_BASE_URL
   ```
   Then enter your Ollama URL when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🖥️ Setting Up Ollama Server

Your Next.js app needs to connect to an Ollama instance. Here are options for hosting Ollama:

### Option 1: DigitalOcean Droplet / AWS EC2

1. **Create a server** (Ubuntu 22.04 recommended)
   - Minimum: 4GB RAM, 2 CPUs
   - Recommended: 8GB RAM, 4 CPUs (for larger models)

2. **Install Ollama**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

3. **Configure Ollama for remote access**
   Edit the Ollama service:
   ```bash
   sudo systemctl edit ollama.service
   ```
   
   Add:
   ```ini
   [Service]
   Environment="OLLAMA_HOST=0.0.0.0:11434"
   ```
   
   Restart:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart ollama
   ```

4. **Pull models**
   ```bash
   ollama pull llama3.2
   ```

5. **Set up firewall** (allow port 11434)
   ```bash
   sudo ufw allow 11434/tcp
   ```

6. **Get your server URL**
   - Use your server's public IP: `http://YOUR_SERVER_IP:11434`
   - Or set up a domain with nginx reverse proxy: `https://ollama.yourdomain.com`

### Option 2: Railway (Easiest Cloud Option)

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Deploy Ollama using their template or Dockerfile
4. Configure the public URL
5. Pull your models
6. Use the Railway-provided URL as your `OLLAMA_BASE_URL`

### Option 3: Docker Container

Create a `docker-compose.yml` for Ollama:

```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    restart: unless-stopped

volumes:
  ollama:
```

Deploy this to any Docker-compatible hosting platform.

## 🔒 Security Considerations

1. **HTTPS for Ollama** - Use a reverse proxy (nginx) with SSL certificates
2. **CORS** - Already configured in the API routes
3. **Rate Limiting** - Consider adding rate limiting for production
4. **Authentication** - Consider adding auth if exposing publicly
5. **Environment Variables** - Never commit `.env.local` or `.env` files

## 🌍 Custom Domain

### On Vercel

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. SSL is automatically provisioned

## 📊 Monitoring

Vercel provides:
- Real-time logs
- Analytics
- Performance metrics
- Error tracking

Access these in your Vercel dashboard under your project.

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Provides deployment rollback

## 🐛 Troubleshooting

### Issue: "Failed to connect to Ollama"

**Solutions:**
1. Verify `OLLAMA_BASE_URL` is correct
2. Check Ollama server is running
3. Ensure firewall allows traffic on port 11434
4. Test the URL: `curl http://your-ollama-url/api/tags`

### Issue: Build fails on Vercel

**Solutions:**
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify `next.config.mjs` is valid
4. Try local build: `npm run build`

### Issue: API routes timeout

**Solutions:**
1. Increase function timeout in `vercel.json`
2. Check Ollama server response time
3. Consider using smaller/faster models

## 📱 Alternative: Netlify Deployment

While Vercel is recommended for Next.js, you can also deploy to Netlify:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Add Environment Variables** in Netlify dashboard

**Note:** Netlify also supports Next.js, but Vercel provides better optimization for Next.js apps.

## 🎯 Post-Deployment Checklist

- [ ] App loads correctly at production URL
- [ ] Chat functionality works
- [ ] Models list loads
- [ ] Theme toggle works
- [ ] Environment variables are set correctly
- [ ] Ollama connection is successful
- [ ] Error handling works properly
- [ ] Mobile responsiveness is good
- [ ] Custom domain (if applicable) is configured
- [ ] Analytics/monitoring is set up

## 📞 Support

If you encounter issues:
1. Check Vercel logs
2. Check Ollama server logs: `sudo journalctl -u ollama -f`
3. Review this deployment guide
4. Check GitHub issues

---

**Happy Deploying! 🚀**

