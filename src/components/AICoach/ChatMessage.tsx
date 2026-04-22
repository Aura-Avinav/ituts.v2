
import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    // Format content to handle basic markdown-like features if needed
    // For now, simple text rendering with line breaks
    const formattedContent = content.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-3 max-w-[85%]",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
        >
            <div className={cn(
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                isUser ? "bg-primary text-primary-foreground" : "bg-surfaceHighlight text-accent"
            )}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={cn(
                "px-4 py-3 rounded-2xl text-sm shadow-sm",
                isUser
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-surfaceHighlight/50 backdrop-blur-sm border border-white/10 text-foreground rounded-tl-none"
            )}>
                {formattedContent}
            </div>
        </motion.div>
    );
}
