import { apiFetch } from '@/api/client';
import { toast } from '@/components/ui/use-toast';

interface ExportData {
  exportDate: string;
  profile: Record<string, unknown> | null;
  moodEntries: Array<Record<string, unknown>>;
  chatMessages: Array<Record<string, unknown>>;
  totalMoodEntries: number;
  totalChatMessages: number;
}

export const exportUserData = async (format: 'json' | 'pdf' = 'json') => {
  try {
    const exportData = await apiFetch<ExportData>('/export');

    if (format === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `calmora-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Dynamically import jspdf only when needed
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      const addText = (text: string, x: number, fontSize = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, x, y);
        y += lines.length * fontSize * 0.5 + 4;
        if (y > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          y = margin;
        }
      };

      pdf.setFontSize(20);
      pdf.text('Calmora Data Export', margin, y);
      y += 30;

      addText(`Export Date: ${new Date(exportData.exportDate).toLocaleDateString()}`, margin, 12);

      if (exportData.profile) {
        pdf.setFontSize(16);
        pdf.text('Profile Information', margin, y);
        y += 15;
        const p = exportData.profile;
        addText(`Name: ${p.first_name || ''} ${p.last_name || ''}`, margin, 12);
        if (p.created_at) addText(`Created: ${new Date(String(p.created_at)).toLocaleDateString()}`, margin, 12);
      }

      pdf.setFontSize(16);
      pdf.text('Mood Entries Summary', margin, y);
      y += 15;
      addText(`Total Mood Entries: ${exportData.totalMoodEntries}`, margin, 12);

      if (exportData.moodEntries.length > 0) {
        addText('Recent Mood Entries (Last 10):', margin, 12);
        exportData.moodEntries.slice(0, 10).forEach((entry, idx) => {
          const text = `${idx + 1}. ${new Date(String(entry.timestamp)).toLocaleDateString()} - Mood: ${entry.mood} (Score: ${entry.score})`;
          addText(text, margin, 10);
        });
      }

      pdf.setFontSize(16);
      pdf.text('Chat Messages Summary', margin, y);
      y += 15;
      addText(`Total Chat Messages: ${exportData.totalChatMessages}`, margin, 12);

      pdf.save(`calmora-data-export-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    toast({
      title: 'Data exported successfully',
      description: `Your data has been downloaded as a ${format.toUpperCase()} file.`,
    });
    return true;
  } catch (error) {
    toast({
      title: 'Export failed',
      description: error instanceof Error ? error.message : 'An error occurred while exporting your data.',
      variant: 'destructive',
    });
    return false;
  }
};
