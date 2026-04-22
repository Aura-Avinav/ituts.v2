import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { CheckCircle2, Circle, Plus, Trash2, CalendarDays, ListTodo, CalendarRange } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal, Button } from './ui/Modal';
import { useSound } from '../hooks/useSound';

export function TodoBoard() {
    const { data, toggleTodo, addTodo, removeTodo } = useStore();
    const { play } = useSound();
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const todos = data.todos.filter(t => t.type === activeTab);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState("");

    const handleAdd = () => {
        if (newTodo.trim()) {
            addTodo(newTodo.trim(), activeTab);
            setNewTodo("");
            setIsAddModalOpen(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 bg-surfaceHighlight/20 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'daily'
                                ? "bg-surfaceHighlight text-primary shadow-sm"
                                : "text-secondary hover:text-primary hover:bg-surfaceHighlight/50"
                        )}
                    >
                        <CalendarDays className="w-3.5 h-3.5" />
                        Today
                    </button>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'weekly'
                                ? "bg-surfaceHighlight text-primary shadow-sm"
                                : "text-secondary hover:text-primary hover:bg-surfaceHighlight/50"
                        )}
                    >
                        <CalendarRange className="w-3.5 h-3.5" />
                        Weekly
                    </button>
                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'monthly'
                                ? "bg-surfaceHighlight text-primary shadow-sm"
                                : "text-secondary hover:text-primary hover:bg-surfaceHighlight/50"
                        )}
                    >
                        <CalendarRange className="w-3.5 h-3.5" />
                        Monthly
                    </button>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1.5 hover:bg-surfaceHighlight rounded-md transition-colors text-secondary hover:text-primary"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
                {todos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center mb-4 text-pink-500">
                            <ListTodo className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-1">
                            {activeTab === 'daily' ? "Plan Your Day" : activeTab === 'weekly' ? "Weekly Targets" : "Monthly Goals"}
                        </h4>
                        <p className="text-sm text-secondary mb-4 max-w-[200px]">
                            {activeTab === 'daily'
                                ? '"The secret of your future is hidden in your daily routine."'
                                : activeTab === 'weekly'
                                    ? '"Consistency is what transforms average into excellence."'
                                    : '"Set your goals high, and don\'t stop until you get there."'}
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-surfaceHighlight text-foreground text-sm font-medium rounded-lg hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Add {activeTab === 'daily' ? 'Task' : activeTab === 'weekly' ? 'Weekly Task' : 'Goal'}
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {todos.map(todo => (
                            <li key={todo.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-surfaceHighlight/30 transition-all">
                                <button
                                    onClick={() => {
                                        toggleTodo(todo.id);
                                        if (!todo.completed) play('pop');
                                    }}
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        todo.completed ? "text-pink-500" : "text-secondary hover:text-pink-400"
                                    )}
                                >
                                    {todo.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <span className={cn(
                                    "flex-1 text-sm transition-all decoration-secondary/50",
                                    todo.completed ? "text-secondary line-through" : "text-foreground"
                                )}>
                                    {todo.text}
                                </span>
                                <button
                                    onClick={() => removeTodo(todo.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-danger/70 hover:text-danger transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={activeTab === 'daily' ? "Add Daily Task" : activeTab === 'weekly' ? "Add Weekly Task" : "Add Monthly Goal"}
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder={activeTab === 'daily' ? "What do you need to do today?" : activeTab === 'weekly' ? "What are your goals for this week?" : "What's your goal for this month?"}
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="w-full bg-background border border-surfaceHighlight rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newTodo.trim()}>Add</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
