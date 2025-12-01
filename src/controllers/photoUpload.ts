import { supabase } from '@/lib/supabase';
import { imageCompressor } from '@/utils/compress';
import { taskCompletionObserver } from '@/controllers/observers/taskCompletionObserver';

export interface UploadParams {
  uri: string;
  userId: string;
  groupId: string;
  taskName: string;
  weekly: boolean;
}

class StoragePushController {
  private bucketName = 'task_submissions';

  async uploadImage(params: UploadParams) {
    try {
      const { uri, userId, groupId, taskName, weekly } = params;

      const compressedUri = await imageCompressor.compress(uri, {
        maxWidth: 1080,
        quality: 0.6,
      });

      const response = await fetch(compressedUri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const fileName = `${groupId}/${userId}/${taskName}/${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, uint8Array, { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data } = supabase.storage.from(this.bucketName).getPublicUrl(fileName);

      taskCompletionObserver.notify({
        taskName,
        groupId,
        userId,
        photoUri: data.publicUrl,
        weekly,
        timestamp: new Date().toISOString(),
      });

      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const storagePush = new StoragePushController();
