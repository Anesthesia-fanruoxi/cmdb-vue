import request from "@/utils/request";
import type { Role } from "@/types";
import type { ApiResponse } from "@/api/menu";

// 获取角色列表
export function getRoleList(params?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  return request.get<
    ApiResponse<{
      list: Role[];
      total: number;
    }>
  >("/system/role/list", {
    params,
  });
}

// 创建角色
export function createRole(data: {
  name: string;
  code: string;
  description?: string;
}) {
  return request.post<ApiResponse<Role>>("/system/role", data);
}

// 更新角色
export function updateRole(data: {
  id: number;
  name: string;
  code: string;
  description?: string;
}) {
  return request.put<ApiResponse<Role>>(`/system/role/${data.id}`, data);
}

// 删除角色
export function deleteRole(id: number) {
  return request.delete<ApiResponse<null>>(`/system/role/${id}`);
}

// 获取角色权限
export function getRolePermissions(roleId: number) {
  return request.get<
    ApiResponse<{
      menuIds: number[];
      permissions: string[];
    }>
  >(`/system/role/${roleId}/permissions`);
}

// 更新角色权限
export function updateRolePermissions(
  roleId: number,
  data: {
    menuIds: number[];
    permissions: string[];
  }
) {
  return request.put<ApiResponse<null>>(
    `/system/role/${roleId}/permissions`,
    data
  );
}
