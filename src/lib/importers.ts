import type { AppData, ToDo, Habit } from '../types';

export async function parseObsidianFiles(files: File[]): Promise<Partial<AppData>> {
    const journal: Record<string, string> = {};
    const todos: ToDo[] = [];

    for (const file of files) {
        if (!file.name.endsWith('.md')) continue;

        const text = await file.text();
        const dateMatch = file.name.match(/^(\d{4}-\d{2}-\d{2})/);

        // 1. Journal Entries (from Daily Notes)
        if (dateMatch) {
            const date = dateMatch[1];
            journal[date] = text;
        }

        // 2. Todos (Parse "- [ ] " anywhere)
        const lines = text.split('\n');
        lines.forEach(line => {
            // Basic regex for unchecked checkboxes: - [ ] or * [ ]
            const todoMatch = line.match(/^(\s*[-*]\s\[\s\]\s)(.+)$/);
            if (todoMatch) {
                todos.push({
                    id: crypto.randomUUID(),
                    text: todoMatch[2].trim(),
                    completed: false,
                    type: 'daily',
                    createdAt: new Date().toISOString()
                });
            }
        });
    }

    return { journal, todos };
}

export async function parseNotionFiles(files: File[]): Promise<Partial<AppData>> {
    // Import Notion CSVs as HABITS (Protocols)
    const habits: Habit[] = [];

    for (const file of files) {
        if (file.name.endsWith('.csv')) {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length < 2) continue;

            const headers = parseCSVLine(lines[0].toLowerCase());

            // Allow "Name", "Title", "Content", "property", "Topic", "Daily Work", "Task", "Todo", "Habit"
            let nameIdx = headers.findIndex(h =>
                h.includes('name') ||
                h.includes('title') ||
                h.includes('content') ||
                h.includes('property') ||
                h.includes('topic') ||
                h.includes('daily work') ||
                h.includes('task') ||
                h.includes('todo') ||
                h.includes('habit')
            );

            // Fallback: Use first column if it looks valid
            if (nameIdx === -1 && headers.length > 0) {
                if (!headers[0].includes('date') && !headers[0].includes('id')) {
                    nameIdx = 0;
                }
            }

            if (nameIdx === -1) {
                console.warn("Could not find a suitable column for habit name in CSV:", headers);
                continue;
            }

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                if (row.length <= nameIdx) continue;

                const habitName = row[nameIdx].trim();

                if (habitName) {
                    habits.push({
                        id: crypto.randomUUID(),
                        name: habitName,
                        completedDates: []
                    });
                }
            }
        }
    }

    return { habits };
}

// Helper for proper CSV parsing with quotes
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    // Clean up quotes from result
    return result.map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
}
