
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const exportUserData = async (userId: string) => {
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

    toast({
      title: "Data exported successfully",
      description: "Your data has been downloaded as a JSON file.",
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
