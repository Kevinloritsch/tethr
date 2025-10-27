import { supabase } from '@/lib/supabase';

export interface UploadParams {
  base64Data: string;
  userId: string;
  groupId: string;
  taskName: string;
}

class StoragePushController {
  private bucketName = 'task_submissions';

  async uploadImage(params: UploadParams) {
    try {
      const { base64Data, userId, groupId, taskName } = params;
      const fileName = `${userId}_${groupId}_${taskName}_${Date.now()}.jpg`;
      const binary = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, binary, { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data } = supabase.storage.from(this.bucketName).getPublicUrl(fileName);

      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const storagePush = new StoragePushController();
