<template>
  <div class="markdown-viewer" v-html="renderedContent"></div>
</template>

<script>
import { computed } from 'vue'
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

export default {
  name: 'MarkdownViewer',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const renderedContent = computed(() => {
      if (!props.content) return ''
      return marked(props.content)
    })

    return {
      renderedContent
    }
  }
}
</script>

<style>
.markdown-viewer {
  line-height: 1.6;
  font-size: 14px;
}

.markdown-viewer h1,
.markdown-viewer h2,
.markdown-viewer h3,
.markdown-viewer h4,
.markdown-viewer h5,
.markdown-viewer h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-viewer h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-viewer h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-viewer p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-viewer code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

.markdown-viewer pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

.markdown-viewer pre code {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

.markdown-viewer blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-viewer ul,
.markdown-viewer ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-viewer table {
  display: block;
  width: 100%;
  overflow: auto;
  margin-top: 0;
  margin-bottom: 16px;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-viewer table th,
.markdown-viewer table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-viewer table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-viewer table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-viewer img {
  max-width: 100%;
  box-sizing: content-box;
}
</style> 