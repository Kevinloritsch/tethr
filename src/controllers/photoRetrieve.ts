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

class PhotoRetrieveController {
  private bucketName = 'task_submissions';

  async getPhotosByGroups(groupIds: string[]): Promise<PhotoSubmission[]> {
    try {
      const allPhotos: PhotoSubmission[] = [];
      const userIds = new Set<string>();

      await Promise.all(
        groupIds.map(async (groupId) => {
          // Step 1: List all user folders under this group
          const { data: userFolders } = await supabase.storage.from(this.bucketName).list(groupId);

          if (!userFolders) return;

          // Step 2: For each user folder under the group
          await Promise.all(
            userFolders.map(async (userFolder) => {
              if (!userFolder.name) return;
              const userId = userFolder.name;
              userIds.add(userId);

              // Step 3: List all task folders for this user
              const { data: taskFolders } = await supabase.storage
                .from(this.bucketName)
                .list(`${groupId}/${userId}`);

              if (!taskFolders) return;

              await Promise.all(
                taskFolders.map(async (taskFolder) => {
                  if (!taskFolder.name) return;
                  const taskPath = `${groupId}/${userId}/${taskFolder.name}`;

                  // Step 4: List all photos inside the task folder
                  const { data: files } = await supabase.storage
                    .from(this.bucketName)
                    .list(taskPath, {
                      sortBy: { column: 'created_at', order: 'desc' },
                    });

                  if (!files) return;

                  const photoPromises = files.map(async (file) => {
                    const { data: urlData } = supabase.storage
                      .from(this.bucketName)
                      .getPublicUrl(`${taskPath}/${file.name}`);

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
        })
      );

      // Step 5: Get usernames for all involved userIds
      const { data: users } = await supabase
        .from('users')
        .select('user_id, username')
        .in('user_id', Array.from(userIds));

      const usernameMap = new Map(users?.map((u) => [u.user_id, u.username]) || []);

      allPhotos.forEach((photo) => {
        photo.username = usernameMap.get(photo.userId) || photo.userId;
      });

      // Step 6: Sort newest first and return
      return allPhotos.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.error('Error retrieving photos:', err);
      return [];
    }
  }
}

export const photoRetrieve = new PhotoRetrieveController();
