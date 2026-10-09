import { AppState, JournalEntry } from '../types';

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
  // Habits sheet + Goals sheet + Journal sheet in combined CSV format
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

  if (state.journalEntries && state.journalEntries.length > 0) {
    rows.push('');
    rows.push('--- JOURNAL & LEARNING NOTES ---');
    rows.push('ID,Date,Time,Topic,Title,WordCount,ReadTimeMin,Energy,Pinned,Tags,Insights,Content');
    state.journalEntries.forEach(j => {
      const wordCount = j.content.trim().split(/\s+/).filter(Boolean).length;
      rows.push([
        `"${j.id}"`,
        `"${j.date}"`,
        `"${j.time || ''}"`,
        `"${(j.topic || '').replace(/"/g, '""')}"`,
        `"${(j.title || '').replace(/"/g, '""')}"`,
        wordCount,
        j.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 200)),
        `"${j.energy || ''}"`,
        j.pinned ? 'YES' : 'NO',
        `"${(j.tags || []).join(';')}"`,
        `"${(j.insights || []).join(' | ').replace(/"/g, '""')}"`,
        `"${j.content.replace(/"/g, '""').replace(/\r?\n/g, '\\n')}"`
      ].join(','));
    });
  }

  const csvContent = rows.join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `apex-life-os-export-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportJournalMarkdown(entries: JournalEntry[], title = 'APEX Journal & Learning Documentation') {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const dateStr = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push(`*Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${sorted.length} entries*\n`);
  lines.push(`---`);
  lines.push(`## Table of Contents`);
  sorted.forEach((e, idx) => {
    lines.push(`${idx + 1}. [${e.title || 'Untitled Note'}](#${(e.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-')}) — *${e.topic} (${e.date})*`);
  });
  lines.push(`\n---\n`);

  sorted.forEach((e) => {
    const wordCount = e.content.trim().split(/\s+/).filter(Boolean).length;
    const readMin = e.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 200));

    lines.push(`## ${e.title || 'Untitled Note'}`);
    lines.push(`**Date & Time:** ${e.date} at ${e.time || '12:00'} · **Topic:** \`${e.topic}\` · **Read Time:** ~${readMin} min (${wordCount} words)`);
    if (e.pinned) {
      lines.push(`> 🌟 **Key Breakthrough / Starred Note**`);
    }
    if (e.tags && e.tags.length > 0) {
      lines.push(`**Tags:** ${e.tags.map(t => `#${t.replace(/^#/, '')}`).join(' ')}`);
    }

    if (e.insights && e.insights.length > 0) {
      lines.push(`\n### Key Takeaways & Insights`);
      e.insights.forEach(ins => {
        lines.push(`- 💡 ${ins}`);
      });
    }

    lines.push(`\n### Notes & Analysis`);
    lines.push(`${e.content.trim()}\n`);
    lines.push(`---\n`);
  });

  const content = lines.join('\n');
  downloadFile(content, `apex-journal-documentation-${dateStr}.md`, 'text/markdown;charset=utf-8;');
}

export function exportJournalCSV(entries: JournalEntry[]) {
  const rows: string[] = [];
  rows.push('ID,Date,Time,Timestamp,Topic,Title,WordCount,ReadTimeMin,Energy,Pinned,Tags,Insights,Content');

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  sorted.forEach(j => {
    const wordCount = j.content.trim().split(/\s+/).filter(Boolean).length;
    rows.push([
      `"${j.id}"`,
      `"${j.date}"`,
      `"${j.time || ''}"`,
      j.timestamp,
      `"${(j.topic || '').replace(/"/g, '""')}"`,
      `"${(j.title || '').replace(/"/g, '""')}"`,
      wordCount,
      j.readTimeMinutes || Math.max(1, Math.ceil(wordCount / 200)),
      `"${j.energy || ''}"`,
      j.pinned ? 'YES' : 'NO',
      `"${(j.tags || []).join(';')}"`,
      `"${(j.insights || []).join(' | ').replace(/"/g, '""')}"`,
      `"${j.content.replace(/"/g, '""').replace(/\r?\n/g, '\\n')}"`
    ].join(','));
  });

  const csvContent = rows.join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `apex-journal-analytics-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportJournalJSON(entries: JournalEntry[]) {
  const jsonStr = JSON.stringify(entries, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `apex-journal-data-${dateStr}.json`, 'application/json');
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
