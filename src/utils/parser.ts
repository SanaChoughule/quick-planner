import { CategoryId, PriorityId, QuadrantId } from '../types/planner';

export interface ParsedTaskInput {
  cleanTitle: string;
  category: CategoryId;
  priority: PriorityId;
  quadrant: QuadrantId;
  estimatedMinutes: number;
  dueTime?: string;
  tags: string[];
}

export function parseQuickInput(raw: string): ParsedTaskInput {
  let text = raw.trim();
  let category: CategoryId = 'deep_work';
  let priority: PriorityId = 'p2_high';
  let quadrant: QuadrantId = 'schedule';
  let estimatedMinutes = 30;
  let dueTime: string | undefined = undefined;
  const tags: string[] = [];

  // Extract category #category
  const catMatch = text.match(/#(deep_work|strategy|health|client|team|personal|deep|strat|fit|work|sync)/i);
  if (catMatch) {
    const rawCat = catMatch[1].toLowerCase();
    if (rawCat === 'deep' || rawCat === 'deep_work') category = 'deep_work';
    else if (rawCat === 'strat' || rawCat === 'strategy') category = 'strategy';
    else if (rawCat === 'fit' || rawCat === 'health') category = 'health';
    else if (rawCat === 'client') category = 'client';
    else if (rawCat === 'team' || rawCat === 'sync') category = 'team';
    else if (rawCat === 'personal') category = 'personal';
    text = text.replace(catMatch[0], '');
  }

  // Extract priority !p1, !p2, !urgent, etc.
  const prioMatch = text.match(/!(p1|p2|p3|p4|urgent|critical|high|low)/i);
  if (prioMatch) {
    const p = prioMatch[1].toLowerCase();
    if (p === 'p1' || p === 'urgent' || p === 'critical') {
      priority = 'p1_urgent';
      quadrant = 'do_first';
    } else if (p === 'p2' || p === 'high') {
      priority = 'p2_high';
      quadrant = 'schedule';
    } else if (p === 'p3') {
      priority = 'p3_medium';
      quadrant = 'delegate';
    } else if (p === 'p4' || p === 'low') {
      priority = 'p4_low';
      quadrant = 'eliminate';
    }
    text = text.replace(prioMatch[0], '');
  }

  // Extract quadrant @q1, @q2, @q3, @q4
  const quadMatch = text.match(/@(q1|q2|q3|q4)/i);
  if (quadMatch) {
    const q = quadMatch[1].toLowerCase();
    if (q === 'q1') quadrant = 'do_first';
    else if (q === 'q2') quadrant = 'schedule';
    else if (q === 'q3') quadrant = 'delegate';
    else if (q === 'q4') quadrant = 'eliminate';
    text = text.replace(quadMatch[0], '');
  }

  // Extract duration: "for 45m", "for 1.5h", "45min", "90m"
  const durMatch = text.match(/(?:for\s+)?(\d+(?:\.\d+)?)\s*(m|min|mins|minutes|h|hr|hours)\b/i);
  if (durMatch) {
    const val = parseFloat(durMatch[1]);
    const unit = durMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      estimatedMinutes = Math.round(val * 60);
    } else {
      estimatedMinutes = Math.round(val);
    }
    text = text.replace(durMatch[0], '');
  }

  // Extract time: "at 14:30", "at 3pm", "at 9:00am", "11:30"
  const timeMatch = text.match(/(?:at\s+)?(\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b)/i);
  if (timeMatch && (timeMatch[0].includes('at') || timeMatch[0].includes(':') || /am|pm/i.test(timeMatch[0]))) {
    const rawTime = timeMatch[1].trim().toLowerCase();
    let hours = 0;
    let mins = 0;
    const isPm = rawTime.includes('pm');
    const isAm = rawTime.includes('am');
    const cleaned = rawTime.replace(/am|pm/g, '').trim();

    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      hours = parseInt(parts[0], 10);
      mins = parseInt(parts[1], 10);
    } else {
      hours = parseInt(cleaned, 10);
      mins = 0;
    }

    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
      dueTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      text = text.replace(timeMatch[0], '');
    }
  }

  // Remaining hashtags as tags
  const tagsMatch = text.match(/#([\w-]+)/g);
  if (tagsMatch) {
    tagsMatch.forEach(t => {
      tags.push(t.replace('#', ''));
      text = text.replace(t, '');
    });
  }

  // Clean trailing punctuation and spaces
  const cleanTitle = text.replace(/\s+/g, ' ').replace(/^[-:,.\s]+|[-:,.\s]+$/g, '').trim() || 'Untitled Session';

  return {
    cleanTitle,
    category,
    priority,
    quadrant,
    estimatedMinutes: estimatedMinutes || 30,
    dueTime,
    tags,
  };
}
