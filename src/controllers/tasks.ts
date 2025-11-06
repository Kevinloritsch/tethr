import { supabase } from '@/lib/supabase';

export interface Task {
  task_name: string;
  recurring: boolean;
}

class TaskController {
  async getTasksForGroup(groupId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('task_name, recurring')
        .eq('group_id', groupId);

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err);
      return [];
    }
  }

  async createTask(groupId: string, taskName: string, recurring: boolean) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            group_id: groupId,
            task_name: taskName,
            recurring: recurring,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return { success: false, message: error.message };
      }

      console.log('Task created successfully:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Unexpected error creating task:', err);
      return { success: false, message: 'Unexpected error occurred.' };
    }
  }
}

export const taskController = new TaskController();
