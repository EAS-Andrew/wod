import { WODOutput } from './types';

export function formatWorkoutForShare(wod: WODOutput): string {
  let text = `🏋️ ${wod.wod_title}\n\n`;
  text += `Format: ${wod.format}`;
  if (wod.time_cap_minutes) {
    text += ` | Time Cap: ${wod.time_cap_minutes} minutes`;
  }
  text += '\n\n';

  wod.sections.forEach((section) => {
    text += `\n${section.name.toUpperCase()}\n`;
    text += '─'.repeat(section.name.length) + '\n';
    section.items.forEach((item) => {
      text += `${item}\n`;
    });
    text += '\n';
  });

  if (wod.equipment && wod.equipment.length > 0) {
    text += `Equipment: ${wod.equipment.join(', ')}\n\n`;
  }

  if (wod.notes) {
    text += `Notes: ${wod.notes}\n`;
  }

  return text.trim();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export async function shareWorkout(wod: WODOutput): Promise<boolean> {
  const text = formatWorkoutForShare(wod);

  if (navigator.share) {
    try {
      await navigator.share({
        title: wod.wod_title,
        text: text,
      });
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  // Fallback to clipboard if share API not available
  return copyToClipboard(text);
}

