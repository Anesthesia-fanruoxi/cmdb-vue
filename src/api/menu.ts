import request from "@/utils/request";

// 获取用户菜单列表
export function getUserMenus() {
  return request({
    url: "/system/menu/user",
    method: "get",
  });
}

// 获取菜单树形结构
export function getMenuTree() {
  return request.get<ApiResponse<MenuTree[]>>("/system/menu/tree");
}

// 菜单按钮类型
export interface MenuButton {
  code: string;
  name: string;
}

// 菜单树节点类型
export interface MenuTree {
  id: number;
  name: string;
  path: string;
  component: string;
  permission: string;
  parent_id: number | null;
  sort: number;
  icon: string;
  is_visible: boolean;
  is_enabled: boolean;
  children?: MenuTree[];
  buttons?: MenuButton[];
  checkedButtons?: string[];
  created_at?: string;
  updated_at?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
