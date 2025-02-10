export interface TableUser {
  id: number
  username: string
  name: string
  nickname: string
  phone: string
  email: string
  status: 'enabled' | 'disabled'
  department?: {
    id: number
    name: string
    code: string
  }
  role?: {
    id: number
    name: string
    code: string
  }
}

export interface Department {
  id: number
  name: string
  code: string
  parent_id: number | null
  children?: Department[]
}

export interface Role {
  id: number
  name: string
  code: string
}

// ... 其他类型定义 