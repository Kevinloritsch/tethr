import { supabase } from '@/lib/supabase';

export interface Task {
  group_id: string;
  task_name: string;
  recurring: boolean;
}

interface GroupType {
  group_id: string;
  group_name: string;
}

class TaskController {
  async getTasksForGroup(groups: GroupType[]): Promise<Task[]> {
    const groupIds = groups.map((g) => g.group_id);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('group_id, task_name, recurring, groups!tasks_group_id_fkey ( group_name )')
        .in('group_id', groupIds);

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      const filteredTasks = (data || [])
        .filter((task: any) => groupIds.includes(task.group_id))
        .map((task: any) => ({
          group_id: task.group_id,
          group_name: task.groups?.group_name || 'Unknown Group',
          task_name: task.task_name,
          recurring: task.recurring,
        }));

      return filteredTasks;
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
