import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { CheckCircle2, Circle, Plus, Trash2, CalendarDays, ListTodo } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modal, Button } from './ui/Modal';

export function WeeklyTodo() {
    const { data, toggleTodo, addTodo, removeTodo } = useStore();

    // In a real app, we'd filter by week. For now, showing all "active" todos.
    const todos = data.todos;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState("");

    const handleAdd = () => {
        if (newTodo.trim()) {
            addTodo(newTodo);
            setNewTodo("");
            setIsAddModalOpen(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <CalendarDays className="w-5 h-5 text-pink-500" />
                    Weekly To-Do
                </h3>
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
                        <h4 className="text-lg font-bold text-foreground mb-1">Plan Your Week</h4>
                        <p className="text-sm text-secondary mb-4 max-w-[200px]">
                            "The key is not to prioritize what's on your schedule, but to schedule your priorities."
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-surfaceHighlight text-foreground text-sm font-medium rounded-lg hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Add New Task
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {todos.map(todo => (
                            <li key={todo.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-surfaceHighlight/30 transition-all">
                                <button
                                    onClick={() => toggleTodo(todo.id)}
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
                title="Add New Task"
            >
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="What do you need to do?"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="w-full bg-background border border-surfaceHighlight rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newTodo.trim()}>Add Task</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
