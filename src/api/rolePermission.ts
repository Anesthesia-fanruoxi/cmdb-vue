import request from "@/utils/request";
import type { ApiResponse } from "@/api/menu";

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
