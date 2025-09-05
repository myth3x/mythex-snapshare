import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; shortCode: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fii conectat pentru a încărca imagini",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages: Array<{ url: string; shortCode: string }> = [];

    for (const file of acceptedFiles) {
      try {
        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('screenshots')
          .getPublicUrl(filePath);

        // Generate short code
        const { data: shortCodeData } = await supabase.rpc('generate_short_code');
        const shortCode = shortCodeData || Math.random().toString(36).substring(2, 10);

        // Save to database
        const { error: dbError } = await supabase
          .from('screenshots')
          .insert({
            user_id: user.id,
            filename: fileName,
            original_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            short_code: shortCode,
            is_public: true
          });

        if (dbError) {
          throw dbError;
        }

        newImages.push({
          url: publicUrl,
          shortCode: shortCode
        });

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully!`,
        });

      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Eroare",
          description: `Eroare la încărcarea ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setUploading(false);
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true
  });

  const copyToClipboard = async (shortCode: string, index: number) => {
    const url = `https://myth3x.pics/${shortCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copiat!",
      description: "Link-ul a fost copiat în clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors animate-fade-in">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'scale-105 text-primary' 
                : 'hover:text-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'animate-bounce' : 'animate-float'}`} />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Eliberează aici...' : 'Drag & Drop sau click pentru upload'}
            </p>
            <p className="text-muted-foreground">
              PNG, JPG, JPEG, GIF, WEBP - Max 10MB per fișier
            </p>
          </div>
        </CardContent>
      </Card>

      {uploading && (
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Se încarcă imaginile...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Imagini încărcate recent:</h3>
          {uploadedImages.map((image, index) => (
            <Card key={index} className="animate-slide-in hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">myth3x.pics/{image.shortCode}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(image.shortCode, index)}
                    className="min-w-[80px]"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiat
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;