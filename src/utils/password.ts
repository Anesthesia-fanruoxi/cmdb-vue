// 密码校验规则
export const passwordRules = {
  required: { required: true, message: '请输入密码', trigger: 'blur' },
  validator: {
    validator: (_: any, value: string, callback: Function) => {
      if (!value) {
        callback()
        return
      }
      
      // 长度检查
      if (value.length < 8 || value.length > 32) {
        callback(new Error('密码长度必须在8-32个字符之间'))
        return
      }
      
      // 复杂度检查
      const patterns = [
        /[A-Z]/,  // 大写字母
        /[a-z]/,  // 小写字母
        /\d/,     // 数字
        /[!@#$%^&*(),.?":{}|<>]/  // 特殊字符
      ]
      
      const missingPatterns = patterns.filter(pattern => !pattern.test(value))
      if (missingPatterns.length > 0) {
        callback(new Error('密码必须包含大小写字母、数字和特殊字符'))
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