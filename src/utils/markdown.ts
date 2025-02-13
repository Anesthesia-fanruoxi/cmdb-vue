import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// Markdown 转 HTML
export const parseMarkdown = (content: string): string => {
  if (!content) return ''
  return marked(content)
}

// 配置 marked 选项
marked.setOptions({
  gfm: true, // 启用 GitHub 风格的 Markdown
  breaks: true, // 启用换行符
  sanitize: false, // 允许 HTML 标签
  smartLists: true,
  smartypants: true
}) 