// 密码校验规则配置
export const passwordRules = [
  {
    message: '长度在 8 到 32 个字符',
    validator: (pwd: string) => pwd.length >= 8 && pwd.length <= 32
  },
  {
    message: '包含至少一个大写字母',
    validator: (pwd: string) => /[A-Z]/.test(pwd)
  },
  {
    message: '包含至少一个小写字母',
    validator: (pwd: string) => /[a-z]/.test(pwd)
  },
  {
    message: '包含至少一个数字',
    validator: (pwd: string) => /\d/.test(pwd)
  },
  {
    message: '包含至少一个特殊字符',
    validator: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  }
]

// Element Plus 表单校验规则
export const formPasswordRules = {
  required: { required: true, message: '请输入密码', trigger: 'blur' },
  validator: {
    validator: (_: any, value: string, callback: Function) => {
      if (!value) {
        callback()
        return
      }
      
      // 使用配置的规则进行校验
      const failedRule = passwordRules.find(rule => !rule.validator(value))
      if (failedRule) {
        callback(new Error(failedRule.message))
        return
      }
      
      callback()
    },
    trigger: 'change'
  }
}

// 确认密码校验规则
export const confirmPasswordRule = (password: string) => ({
  validator: (_: any, value: string, callback: Function) => {
    if (value !== password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  },
  trigger: 'blur'
}) 