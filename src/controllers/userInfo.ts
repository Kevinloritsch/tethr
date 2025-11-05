import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

class UserController {
  async getUsername(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', user.id)
      .single();
    if (error) return null;

    return data?.username || null;
  }

  async getName(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('user_id', user.id)
      .single();

    if (error) return null;

    return data?.name || null;
  }

  async getEmail(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('user_id', user.id)
      .single();

    if (error) return null;

    return data?.email || null;
  }

  async getId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Cannot fetch user id:', error);
      return null;
    }
  }

  async getNumCompletedTasks(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data, error } = await supabase
      .from('users')
      .select('num_completed_tasks')
      .eq('user_id', user.id)
      .single();
    if (error) return -1;

    return data?.num_completed_tasks || 0;
  }

  async getUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Cannot get user:', error);
      return null;
    }
  }

  async logout(): Promise<boolean> {
    try {
      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  }
}

export const userController = new UserController();
