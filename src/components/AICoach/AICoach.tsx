
import React, { useState, useRef, useEffect } from 'react';
// import { useChat } from 'ai/react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { cn } from '../../lib/utils';

import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { buildSystemPrompt } from '../../lib/ai-context';
import { format } from 'date-fns';

export function AICoach() {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("AI Coach: Initialized");
    }, []);

    // Vercel AI SDK hook for chat management - keeping for future server integration
    // const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    //     api: '/api/chat', 
    // });

    // Custom chat handler for client-side Gemini
    const { data, user, addHabit, addTodo, updateJournal, updateMetric } = useStore();
    const { t } = useTranslation();

    // No localStorage - fresh session every time
    const [localMessages, setLocalMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [localInput, setLocalInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleLocalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isGenerating) return;

        // ... existing auth check ...



        const userMsg = { role: 'user' as const, content: localInput };
        setLocalMessages(prev => [...prev, userMsg]);
        setLocalInput('');
        setIsGenerating(true);

        try {
            // ... existing import ...


            // ... existing system prompt ...
            const systemPrompt = buildSystemPrompt(data, user?.user_metadata?.name || "User");



            // --- SERVER-SIDE PROXY CALL (OPENAI) ---
            const sendMessageViaProxy = async () => {



                const messagesPayload = [
                    { role: "system", content: systemPrompt },
                    ...localMessages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'assistant',
                        content: m.content
                    })),
                    { role: "user", content: userMsg.content } // Add current message explicitly
                ];

                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messagesPayload,
                        modelName: "gemini-1.5-flash"
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Server Error");
                }

                const data = await response.json();
                return data.response;
            };

            const responseText = await sendMessageViaProxy();

            console.log("Raw AI Response:", responseText);

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(responseText);
            } catch (e) {
                // Fallback if model outputs markdown-wrapped JSON despite instructions
                const match = responseText.match(/({[\s\S]*})/);
                if (match) {
                    try { parsedResponse = JSON.parse(match[1]); } catch (err) { }
                }
            }

            let finalMessage = "I'm having trouble understanding the response format.";

            if (parsedResponse) {
                const { message, tool_call } = parsedResponse;
                if (message) finalMessage = message;

                if (tool_call) {
                    console.log("Executing Tool:", tool_call);
                    // Add a temporary "Thinking..." or "Action..." visual could be nice here

                    try {
                        if (tool_call.name === 'add_habit') {
                            const { title } = tool_call.arguments;
                            await addHabit(title, undefined);
                            // Verify?
                        }

                        if (tool_call.name === 'add_todo') {
                            const { text, priority } = tool_call.arguments;
                            await addTodo(text + (priority ? ` [${priority}]` : ''), 'daily');
                        }

                        if (tool_call.name === 'log_journal') {
                            const { content, mood } = tool_call.arguments;
                            const today = format(new Date(), 'yyyy-MM-dd');
                            await updateJournal(today, content);
                            if (mood) {
                                const moodMap: Record<string, number> = { "great": 5, "good": 4, "neutral": 3, "bad": 2, "awful": 1 };
                                await updateMetric(today, 'mood', moodMap[mood.toLowerCase()] || 3);
                            }
                        }
                    } catch (err) {
                        console.error("Tool Action Failed", err);
                        finalMessage += " (Action failed to execute).";
                    }
                }
            } else {
                // Fallback for non-JSON text (shouldn't happen with valid config)
                finalMessage = responseText;
            }

            setLocalMessages(prev => [...prev, { role: 'assistant', content: finalMessage }]);
        } catch (err: any) {
            console.error("AI Error:", err);
            const errorMessage = err.message || "Unknown error";

            let friendlyError = errorMessage;
            if (errorMessage.includes("429") || errorMessage.includes("insufficient_quota") || errorMessage.includes("Quota exceeded")) {
                friendlyError = "I'm temporarily unavailable because the AI service has reached its quota limit. Please check your API billing or try again later! 🕒";
            }

            setLocalMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${friendlyError}`
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [localMessages]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto mb-4 w-[350px] md:w-[400px] h-[500px] max-h-[80vh] bg-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">AI Coach</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs font-medium text-emerald-500/90 tracking-wide">
                                            Powered by Gemini
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setLocalMessages([])}
                                className="text-xs text-secondary hover:text-foreground transition-colors mr-2"
                                title="Clear Chat"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        >
                            {localMessages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-secondary space-y-3 opacity-60">
                                    <Bot size={48} className="text-accent/50 mb-2" />
                                    <p className="text-sm">Hi! I'm your personal AI coach.</p>
                                    <p className="text-xs max-w-[200px]">{t('Ask me to analyze your habits, suggest improvements, or just chat about your day!')}</p>
                                </div>
                            )}

                            {localMessages.map((msg, i) => (
                                <ChatMessage key={i} role={msg.role} content={msg.content} />
                            ))}

                            {isGenerating && (
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-surfaceHighlight text-accent flex items-center justify-center shadow-sm">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-surfaceHighlight/50 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleLocalSubmit} className="p-3 border-t border-white/10 bg-white/5">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={localInput}
                                    onChange={(e) => setLocalInput(e.target.value)}
                                    placeholder="Ask your coach..."
                                    className="w-full bg-surfaceHighlight/50 border border-white/5 rounded-xl py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!localInput.trim() || isGenerating}
                                    className="absolute right-2 p-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/20",
                    isOpen
                        ? "bg-surface text-secondary hover:text-foreground"
                        : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                )}
            >
                {isOpen ? <X size={28} /> : <Bot size={28} />}
            </motion.button>
        </div>
    );
}
