import { supabase } from '@/lib/supabase';

export interface PhotoSubmission {
  name: string;
  publicUrl: string;
  userId: string;
  groupId: string;
  taskName: string;
  createdAt: string;
}

class PhotoRetrieveController {
  private bucketName = 'task_submissions';

  private parseFileName(fileName: string) {
    const parts = fileName.replace('.jpg', '').split('_');
    return {
      userId: parts[0] || 'unknown',
      groupId: parts[1] || 'unknown',
      taskName: parts[2] || 'unknown',
    };
  }

  async getAllPhotos(): Promise<PhotoSubmission[]> {
    try {
      const { data, error } = await supabase.storage.from(this.bucketName).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      return data.map((file) => {
        const metadata = this.parseFileName(file.name);
        const { data: urlData } = supabase.storage.from(this.bucketName).getPublicUrl(file.name);

        return {
          name: file.name,
          publicUrl: urlData.publicUrl,
          createdAt: file.created_at,
          ...metadata,
        };
      });
    } catch (err) {
      console.error('Error retrieving photos:', err);
      return [];
    }
  }
}

export const photoRetrieve = new PhotoRetrieveController();
