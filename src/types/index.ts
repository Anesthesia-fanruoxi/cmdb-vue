// 角色类型
export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// 其他类型定义...
// 注意：不要在这里定义 MenuTree，使用 @/api/menu 中的定义
