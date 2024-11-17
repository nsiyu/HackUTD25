import { Note } from './notes';
import html2pdf from 'html2pdf.js';

export const exportService = {
  async exportToPdf(note: Note) {
    // Create a temporary div to render the note content
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; margin-bottom: 20px;">${note.title}</h1>
        <div style="color: #666; line-height: 1.6;">
          ${note.content}
        </div>
      </div>
    `;

    const options = {
      margin: 1,
      filename: `${note.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(options).from(element).save();
      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      return false;
    }
  },

  generateShareLink(noteId: string): string {
    return `https://yourapp.com/share/${noteId}`;
  }
};