import { supabase } from '@/lib/supabase';

export interface PhotoSubmission {
  name: string;
  publicUrl: string;
  userId: string;
  username: string;
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
      const userIds = new Set<string>();

      await Promise.all(
        pairs.map(async ({ userId, groupId }) => {
          userIds.add(userId);

          const { data: taskFolders } = await supabase.storage
            .from(this.bucketName)
            .list(`${userId}/${groupId}`);

          if (!taskFolders) return;

          await Promise.all(
            taskFolders.map(async (taskFolder) => {
              if (!taskFolder.name) return;

              const path = `${userId}/${groupId}/${taskFolder.name}`;

              const { data: files } = await supabase.storage
                .from(this.bucketName)
                .list(path, { sortBy: { column: 'created_at', order: 'desc' } });

              if (!files) return;

              const photoPromises = files.map(async (file) => {
                const { data: urlData } = supabase.storage
                  .from(this.bucketName)
                  .getPublicUrl(`${path}/${file.name}`);

                allPhotos.push({
                  name: file.name,
                  publicUrl: urlData.publicUrl,
                  createdAt: file.created_at,
                  userId,
                  username: '',
                  groupId,
                  taskName: taskFolder.name,
                });
              });

              await Promise.all(photoPromises);
            })
          );
        })
      );

      const { data: users } = await supabase
        .from('users')
        .select('user_id, username')
        .in('user_id', Array.from(userIds));

      const usernameMap = new Map(users?.map((u) => [u.user_id, u.username]) || []);

      allPhotos.forEach((photo) => {
        photo.username = usernameMap.get(photo.userId) || photo.userId;
      });

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
