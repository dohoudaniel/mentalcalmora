import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (file: File) => Promise<string | null>;
  fallbackText: string;
}

export default function ImageUpload({ currentImageUrl, onImageUpload, fallbackText }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image smaller than 5MB.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const uploadedUrl = await onImageUpload(file);
      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl);
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayUrl || undefined} alt="Profile avatar" />
          <AvatarFallback className="bg-lavender text-white text-lg">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          onClick={triggerFileSelect}
          disabled={uploading}
          type="button"
          aria-label="Change profile photo"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <Button variant="outline" onClick={triggerFileSelect} disabled={uploading} className="text-sm" type="button">
        {uploading ? 'Uploading...' : 'Change Photo'}
      </Button>
    </div>
  );
}
