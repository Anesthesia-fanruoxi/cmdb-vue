import { marked } from 'marked'

// Markdown 转 HTML
export const parseMarkdown = (content: string): string => {
  return marked(content) // 使用 marked() 而不是 marked.parse()
}

// 配置 marked 选项
marked.setOptions({
  gfm: true, // 启用 GitHub 风格的 Markdown
  breaks: true, // 启用换行符
  sanitize: false, // 允许 HTML 标签
  smartLists: true,
  smartypants: true
}) 