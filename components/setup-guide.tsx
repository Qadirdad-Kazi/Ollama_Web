"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal, Globe, Copy, Check } from "lucide-react"

export function SetupGuide() {
    const [copied, setCopied] = useState(false)

    const copyCommand = () => {
        navigator.clipboard.writeText("node scripts/register-models.js")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Globe className="w-4 h-4" />
                    Connect Remote Model
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Connect Remote Models</DialogTitle>
                    <DialogDescription>
                        Learn how to connect models running on your local machine or another server.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="cli" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cli">Automatic (CLI Script)</TabsTrigger>
                        <TabsTrigger value="manual">Manual Registration</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cli" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h3 className="font-medium flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Step 1: Expose your Local Ollama
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You need to make your local Ollama instance accessible to the internet. We recommend using <strong>ngrok</strong>.
                            </p>
                            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-2">
                                <li>
                                    <a href="https://dashboard.ngrok.com/signup" target="_blank" className="underline text-primary">Sign up for ngrok</a> and get your Authtoken.
                                </li>
                                <li>
                                    Run this command in your terminal (replace <code>YOUR_TOKEN</code>):
                                    <div className="bg-slate-950 text-slate-50 p-2 rounded-md font-mono text-xs mt-1">
                                        <code>ngrok config add-authtoken YOUR_TOKEN</code>
                                    </div>
                                </li>
                                <li>
                                    Start the tunnel:
                                    <div className="bg-slate-950 text-slate-50 p-2 rounded-md font-mono text-xs mt-1">
                                        <code>ngrok http 11434</code>
                                    </div>
                                </li>
                                <li>Copy the "Forwarding" URL (e.g., <code>https://xxxx.ngrok-free.app</code>).</li>
                            </ol>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Step 2: Run the registration script
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Open a <strong>new terminal tab</strong> and run this command:
                            </p>
                            <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                                <code>curl -sL {typeof window !== 'undefined' ? window.location.origin : ''}/register-models.js | node</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                                    navigator.clipboard.writeText(`curl -sL ${window.location.origin}/register-models.js | node`)
                                    setCopied(true)
                                    setTimeout(() => setCopied(false), 2000)
                                }}>
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Step 3: Follow the prompts</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                <li><strong>Web App URL:</strong> Enter <code>{typeof window !== 'undefined' ? window.location.origin : '...'}</code></li>
                                <li><strong>Public URL:</strong> Enter your ngrok URL from Step 1.</li>
                                <li><strong>API Key:</strong> Enter your OLLAMA_API_KEY (if you set one).</li>
                            </ul>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">When to use this?</h3>
                            <p className="text-sm text-muted-foreground">
                                Use manual registration if you want to add a single model or if you cannot run the Node.js script on the host machine.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">How to register</h3>
                            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                                <li>Go to the <strong>Settings</strong> page.</li>
                                <li>Scroll to <strong>Register External Model</strong>.</li>
                                <li>Enter a name for your model (e.g., "my-laptop-llama").</li>
                                <li>Enter the Base URL where the model is hosted (e.g., <code>https://my-api.ngrok.io</code>).</li>
                                <li>Click Register.</li>
                            </ol>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
