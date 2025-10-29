import { supabase } from '@/lib/supabase';

export interface PhotoSubmission {
  name: string;
  publicUrl: string;
  userId: string;
  groupId: string;
  taskName: string;
  createdAt: string;
}

export interface UserGroupPair {
  userId: string;
  groupId: string;
}

class PhotoRetrieveController {
  private bucketName = 'task_submissions';

  async getPhotosByUserGroups(pairs: UserGroupPair[]): Promise<PhotoSubmission[]> {
    try {
      const allPhotos: PhotoSubmission[] = [];

      for (const { userId, groupId } of pairs) {
        const { data: taskFolders } = await supabase.storage
          .from(this.bucketName)
          .list(`${userId}/${groupId}`, { limit: 100 });

        for (const taskFolder of taskFolders || []) {
          if (!taskFolder.name) continue;

          const path = `${userId}/${groupId}/${taskFolder.name}`;

          const { data: files } = await supabase.storage
            .from(this.bucketName)
            .list(path, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

          for (const file of files || []) {
            const { data: urlData } = supabase.storage
              .from(this.bucketName)
              .getPublicUrl(`${path}/${file.name}`);

            allPhotos.push({
              name: file.name,
              publicUrl: urlData.publicUrl,
              createdAt: file.created_at,
              userId,
              groupId,
              taskName: taskFolder.name,
            });
          }
        }
      }

      return allPhotos
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 100);
    } catch (err) {
      console.error('Error retrieving photos:', err);
      return [];
    }
  }
}

export const photoRetrieve = new PhotoRetrieveController();
