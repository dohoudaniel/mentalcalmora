
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';

export const exportUserData = async (userId: string, format: 'json' | 'pdf' = 'json') => {
  try {
    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Fetch mood entries
    const { data: moodEntries, error: moodError } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (moodError) {
      console.error('Error fetching mood entries:', moodError);
    }

    // Fetch chat messages
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (chatError) {
      console.error('Error fetching chat messages:', chatError);
    }

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      profile: profile || null,
      moodEntries: moodEntries || [],
      chatMessages: chatMessages || [],
      totalMoodEntries: moodEntries?.length || 0,
      totalChatMessages: chatMessages?.length || 0,
    };

    if (format === 'json') {
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `calmora-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addTextWithWrap = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.5);
      };

      // Title
      pdf.setFontSize(20);
      pdf.text('Calmora Data Export', margin, yPosition);
      yPosition += 30;

      // Export date
      pdf.setFontSize(12);
      pdf.text(`Export Date: ${new Date(exportData.exportDate).toLocaleDateString()}`, margin, yPosition);
      yPosition += 20;

      // Profile information
      pdf.setFontSize(16);
      pdf.text('Profile Information', margin, yPosition);
      yPosition += 15;
      
      if (profile) {
        pdf.setFontSize(12);
        pdf.text(`Name: ${profile.first_name} ${profile.last_name}`, margin, yPosition);
        yPosition += 10;
        pdf.text(`Created: ${new Date(profile.created_at).toLocaleDateString()}`, margin, yPosition);
        yPosition += 20;
      }

      // Mood entries summary
      pdf.setFontSize(16);
      pdf.text('Mood Entries Summary', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.text(`Total Mood Entries: ${exportData.totalMoodEntries}`, margin, yPosition);
      yPosition += 15;

      // Recent mood entries
      if (moodEntries && moodEntries.length > 0) {
        pdf.text('Recent Mood Entries (Last 10):', margin, yPosition);
        yPosition += 10;
        
        const recentEntries = moodEntries.slice(0, 10);
        recentEntries.forEach((entry, index) => {
          if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const entryText = `${index + 1}. ${new Date(entry.timestamp).toLocaleDateString()} - Mood: ${entry.mood} (Score: ${entry.score})`;
          yPosition = addTextWithWrap(entryText, margin, yPosition, pageWidth - 2 * margin, 10);
          yPosition += 5;
        });
      }

      yPosition += 20;

      // Chat messages summary
      if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(16);
      pdf.text('Chat Messages Summary', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.text(`Total Chat Messages: ${exportData.totalChatMessages}`, margin, yPosition);

      // Save PDF
      pdf.save(`calmora-data-export-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    toast({
      title: "Data exported successfully",
      description: `Your data has been downloaded as a ${format.toUpperCase()} file.`,
    });

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    toast({
      title: "Export failed",
      description: "An error occurred while exporting your data. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
