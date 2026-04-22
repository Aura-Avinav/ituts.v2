import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Award, Plus, Trash2, Trophy } from 'lucide-react';
import { Modal, Button } from './ui/Modal';

export function AchievementBoard({ date }: { date: Date }) {
    const { data, addAchievement, removeAchievement } = useStore();
    const currentMonth = date.toISOString().slice(0, 7); // YYYY-MM

    const monthAchievements = data.achievements.filter(a => a.month === currentMonth);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAchievement, setNewAchievement] = useState("");

    const handleAdd = () => {
        if (newAchievement.trim()) {
            addAchievement(newAchievement, currentMonth);
            setNewAchievement("");
            setIsAddModalOpen(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Award className="w-5 h-5 text-accent" />
                    Achievements
                </h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1.5 hover:bg-surfaceHighlight rounded-md transition-colors text-secondary hover:text-primary"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
                {monthAchievements.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-1">Celebrate Wins</h4>
                        <p className="text-sm text-secondary mb-4 max-w-[200px]">
                            "Small wins lead to big victories. Record your progress here."
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-surfaceHighlight text-foreground text-sm font-medium rounded-lg hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Log Achievement
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {monthAchievements.map((achievement, index) => (
                            <li key={achievement.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-surfaceHighlight/30 transition-colors border border-transparent hover:border-surfaceHighlight/50">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold font-mono mt-0.5">
                                    {index + 1}
                                </span>
                                <span className="flex-1 text-sm text-foreground/90 leading-relaxed">
                                    {achievement.text}
                                </span>
                                <button
                                    onClick={() => removeAchievement(achievement.id)}
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
                title="Add Achievement"
            >
                <div className="space-y-4">
                    <textarea
                        placeholder="What did you achieve?"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleAdd()}
                        className="w-full bg-background border border-surfaceHighlight rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent min-h-[100px] resize-none"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newAchievement.trim()}>Add Win</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
