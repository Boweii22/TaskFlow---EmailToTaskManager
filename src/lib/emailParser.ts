import { format, addDays, parseISO } from 'date-fns';

export interface ParsedEmailContent {
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export class EmailParser {
  static parseEmail(subject: string, body: string): ParsedEmailContent {
    const title = subject.trim();
    let description = body.trim();
    let dueDate: string | null = null;
    let priority: 'low' | 'medium' | 'high' = 'medium';
    let tags: string[] = [];

    // Parse due date
    const dueDatePatterns = [
      /Due:\s*(\d{4}-\d{2}-\d{2})/i,
      /Due:\s*(\d{2}\/\d{2}\/\d{4})/i,
      /Due:\s*(today)/i,
      /Due:\s*(tomorrow)/i,
      /Due:\s*(\d+)\s*days?/i,
    ];

    for (const pattern of dueDatePatterns) {
      const match = description.match(pattern);
      if (match) {
        const dateStr = match[1].toLowerCase();
        
        if (dateStr === 'today') {
          dueDate = format(new Date(), 'yyyy-MM-dd');
        } else if (dateStr === 'tomorrow') {
          dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        } else if (/^\d+$/.test(dateStr)) {
          const days = parseInt(dateStr);
          dueDate = format(addDays(new Date(), days), 'yyyy-MM-dd');
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          dueDate = dateStr;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          const [month, day, year] = dateStr.split('/');
          dueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        description = description.replace(match[0], '').trim();
        break;
      }
    }

    // Parse priority
    const priorityPattern = /Priority:\s*(high|medium|low)/i;
    const priorityMatch = description.match(priorityPattern);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase() as 'low' | 'medium' | 'high';
      description = description.replace(priorityMatch[0], '').trim();
    }

    // Parse tags
    const tagsPattern = /Tags:\s*([^\n\r]+)/i;
    const tagsMatch = description.match(tagsPattern);
    if (tagsMatch) {
      tags = tagsMatch[1]
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      description = description.replace(tagsMatch[0], '').trim();
    }

    return {
      title,
      description,
      dueDate,
      priority,
      tags,
    };
  }
}