import type { User } from './types';

const STORAGE_KEY = 'xiaoyu_user';

/**
 * Supabase 客户端接口
 */
interface SupabaseClient {
  from(table: string): SupabaseQueryBuilder;
}

interface SupabaseQueryBuilder {
  insert(data: any): SupabaseQueryBuilder;
  select(columns?: string): SupabaseQueryBuilder;
  update(data: any): SupabaseQueryBuilder;
  eq(column: string, value: any): SupabaseQueryBuilder;
  single(): Promise<{ data: any; error: any }>;
}

/**
 * 用户服务 - 管理匿名用户识别
 * 使用设备ID追踪用户，无需登录即可收集行为数据
 */
export class UserService {
  private currentUser: User | null = null;
  private supabase: SupabaseClient | null = null;

  constructor() {
    // 尝试从本地存储加载现有用户
    this.loadUserFromStorage();
  }

  /**
   * 设置 Supabase 客户端
   */
  setSupabaseClient(client: SupabaseClient): void {
    this.supabase = client;
  }

  /**
   * 获取或创建用户
   * 如果用户不存在，创建新的匿名用户并插入数据库
   */
  async getOrCreateUser(): Promise<User> {
    if (this.currentUser) {
      // 确保用户在数据库中存在
      await this.ensureUserInDatabase(this.currentUser);
      return this.currentUser;
    }

    // 创建新用户
    const deviceId = this.generateDeviceId();
    const now = new Date();

    const newUser: User = {
      id: deviceId, // 暂时使用 deviceId 作为 id，数据库会生成真正的 UUID
      deviceId,
      createdAt: now,
      lastActiveAt: now,
    };

    // 插入到数据库并获取真正的 ID
    const dbUser = await this.insertUserToDatabase(newUser);
    if (dbUser) {
      this.currentUser = dbUser;
    } else {
      this.currentUser = newUser;
    }

    this.saveUserToStorage(this.currentUser);
    return this.currentUser;
  }

  /**
   * 获取当前用户（不创建新用户）
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 更新最后活跃时间
   */
  async updateLastActiveAt(): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    this.currentUser = {
      ...this.currentUser,
      lastActiveAt: new Date(),
    };

    this.saveUserToStorage(this.currentUser);

    // 更新数据库
    if (this.supabase && this.currentUser.id) {
      try {
        await this.supabase
          .from('users')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', this.currentUser.id);
      } catch (error) {
        console.warn('Failed to update user last_active_at:', error);
      }
    }
  }

  /**
   * 确保用户在数据库中存在
   */
  private async ensureUserInDatabase(user: User): Promise<void> {
    if (!this.supabase) {
      console.warn('Supabase client not set, skipping database sync');
      return;
    }

    try {
      // 检查用户是否存在
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('device_id', user.deviceId)
        .single();

      if (error || !data) {
        // 用户不存在，插入新用户
        const dbUser = await this.insertUserToDatabase(user);
        if (dbUser) {
          this.currentUser = dbUser;
          this.saveUserToStorage(dbUser);
        }
      } else if (data.id !== user.id) {
        // 更新本地用户的数据库 ID
        this.currentUser = { ...user, id: data.id };
        this.saveUserToStorage(this.currentUser);
      }
    } catch (error) {
      console.warn('Failed to ensure user in database:', error);
    }
  }

  /**
   * 插入用户到数据库
   */
  private async insertUserToDatabase(user: User): Promise<User | null> {
    if (!this.supabase) {
      console.warn('Supabase client not set, skipping database insert');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          device_id: user.deviceId,
          is_anonymous: true,
          created_at: user.createdAt.toISOString(),
          last_active_at: user.lastActiveAt.toISOString(),
        })
        .select('id, device_id, created_at, last_active_at')
        .single();

      if (error) {
        console.error('Failed to insert user to database:', error);
        return null;
      }

      return {
        id: data.id,
        deviceId: data.device_id,
        createdAt: new Date(data.created_at),
        lastActiveAt: new Date(data.last_active_at),
      };
    } catch (error) {
      console.error('Failed to insert user to database:', error);
      return null;
    }
  }

  /**
   * 生成设备唯一ID
   */
  generateDeviceId(): string {
    return crypto.randomUUID();
  }

  /**
   * 从本地存储加载用户
   */
  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentUser = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastActiveAt: new Date(parsed.lastActiveAt),
        };
      }
    } catch (error) {
      console.warn('Failed to load user from storage:', error);
      this.currentUser = null;
    }
  }

  /**
   * 保存用户到本地存储
   */
  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user to storage:', error);
    }
  }
}

// 导出单例实例
export const userService = new UserService();
