import { AppState } from '../types';

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJSON(state: AppState) {
  const jsonStr = JSON.stringify(state, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `apex-life-os-backup-${dateStr}.json`, 'application/json');
}

export function exportCSV(state: AppState) {
  // Habits sheet + Goals sheet in combined CSV format
  const rows: string[] = [];

  rows.push('--- HABITS ---');
  rows.push('ID,Name,Icon,Color,CreatedAt,TotalCompletions,CompletedDates');
  state.habits.forEach(h => {
    rows.push([
      `"${h.id}"`,
      `"${h.name.replace(/"/g, '""')}"`,
      `"${h.icon}"`,
      `"${h.color}"`,
      `"${h.createdAt}"`,
      h.completedDates.length,
      `"${h.completedDates.join(';')}"`
    ].join(','));
  });

  rows.push('');
  rows.push('--- GOALS ---');
  rows.push('ID,Name,StartDate,TargetDate,IsDone,DoneDate,SubtaskCount,DoneSubtasks,ProgressPercentage');
  state.goals.forEach(g => {
    const doneSubtasks = g.subtasks.filter(s => s.isDone).length;
    const progress = g.isDone ? 100 : (g.subtasks.length > 0 ? Math.round((doneSubtasks / g.subtasks.length) * 100) : 0);
    rows.push([
      `"${g.id}"`,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.startDate}"`,
      `"${g.targetDate || ''}"`,
      g.isDone ? 'YES' : 'NO',
      `"${g.doneDate || ''}"`,
      g.subtasks.length,
      doneSubtasks,
      `${progress}%`
    ].join(','));
  });

  const csvContent = rows.join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `apex-habits-and-goals-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportMoodTXT(state: AppState) {
  const lines: string[] = [];
  lines.push('====================================================');
  lines.push('             APEX LIFE OS — MOOD JOURNAL             ');
  lines.push('====================================================\n');

  if (state.moodEntries.length === 0) {
    lines.push('No mood entries logged yet.');
  } else {
    // Sort latest first
    const sorted = [...state.moodEntries].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach(entry => {
      lines.push(`Date: ${entry.date}`);
      lines.push(`Mood: ${entry.emoji} ${entry.label.toUpperCase()}`);
      if (entry.note && entry.note.trim()) {
        lines.push(`Journal Entry:\n${entry.note.trim()}`);
      } else {
        lines.push(`Journal Entry: (No notes logged)`);
      }
      lines.push('----------------------------------------------------\n');
    });
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(lines.join('\n'), `apex-mood-journal-${dateStr}.txt`, 'text/plain;charset=utf-8;');
}

export const exportDataAsJSON = exportJSON;
export const exportDataAsCSV = exportCSV;
export const exportDataAsTXT = exportMoodTXT;

export function parseImportJSON(fileText: string): AppState | null {
  try {
    const data = JSON.parse(fileText);
    if (!data || !Array.isArray(data.habits) || !Array.isArray(data.goals)) {
      throw new Error('Invalid APEX backup format');
    }
    return data as AppState;
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
    return null;
  }
}
