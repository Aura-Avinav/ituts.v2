import { useCallback } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

// We will use inline base64 for a simple "pop" sound to avoid external dependency issues for now.
// This is a short, pleasant "pop" sound.
// const POP_SOUND = "data:audio/wav;base64,..."; 
// const SUCCESS_SOUND = "data:audio/wav;base64,...";

export function useSound() {
    const { preferences } = usePreferences();

    const play = useCallback((type: 'pop' | 'success' = 'pop') => {
        if (!preferences.soundEnabled) return;

        try {
            // Using Web Audio API for synthesis is better than loading files for simple UI sounds
            // It's cleaner, faster, and requires no assets.
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'pop') {
                // Short high-pitch pop
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.05);
            } else if (type === 'success') {
                // Pleasant major chord ripple
                const now = ctx.currentTime;

                const notes = [523.25, 659.25, 783.99]; // C Major
                notes.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);

                    o.frequency.value = freq;
                    o.type = 'sine';

                    g.gain.setValueAtTime(0, now + i * 0.05);
                    g.gain.linearRampToValueAtTime(0.05, now + i * 0.05 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);

                    o.start(now + i * 0.05);
                    o.stop(now + i * 0.05 + 0.4);
                });
            }

        } catch (e) {
            console.error("Audio play failed", e);
        }
    }, [preferences.soundEnabled]);

    return { play };
}
