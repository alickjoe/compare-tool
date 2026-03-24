export type Language = 'zh' | 'en'

export interface Translations {
  // Header
  title: string
  
  // Toolbar
  format: string
  viewMode: {
    sideBySide: string
    inline: string
  }
  swap: string
  clear: string
  compare: string
  
  // Input areas
  originalText: string
  newText: string
  pasteOrUpload: string
  pasteOrUploadNew: string
  
  // Actions
  upload: string
  formatCode: string
  syntaxCheck: string
  copied: string
  copy: string
  
  // Syntax status
  syntaxValid: string
  syntaxErrors: string
  
  // Diff result
  diffResult: string
  added: string
  removed: string
  modified: string
  export: string
  
  // Format options
  formats: {
    plaintext: string
    json: string
    xml: string
    html: string
    yaml: string
    shell: string
    ini: string
  }
  
  // Empty state
  startCompare: string
  emptyDescription: string
  
  // Footer
  footer: string
  
  // Theme
  lightMode: string
  darkMode: string
  
  // Language
  language: string
  chinese: string
  english: string
  
  // Errors
  syntaxError: string
  formatError: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    title: '文本对比工具',
    format: '格式',
    viewMode: {
      sideBySide: '并排',
      inline: '内联',
    },
    swap: '交换',
    clear: '清空',
    compare: '对比',
    originalText: '原始文本',
    newText: '新文本',
    pasteOrUpload: '粘贴或输入原始文本内容...',
    pasteOrUploadNew: '粘贴或输入新文本内容...',
    upload: '上传文件',
    formatCode: '格式化',
    syntaxCheck: '语法检查',
    copied: '已复制',
    copy: '复制',
    syntaxValid: '语法正确',
    syntaxErrors: '个错误',
    diffResult: '对比结果',
    added: '新增',
    removed: '删除',
    modified: '修改',
    export: '导出',
    formats: {
      plaintext: '纯文本',
      json: 'JSON',
      xml: 'XML',
      html: 'HTML',
      yaml: 'YAML',
      shell: 'Shell',
      ini: 'INI',
    },
    startCompare: '开始对比文本',
    emptyDescription: '在上方输入框中粘贴或上传文本内容，然后点击"对比"按钮查看差异。支持JSON、XML、HTML、YAML、Shell、INI等多种格式的语法检查和格式化。',
    footer: '文本对比工具 - 支持多种格式的文本对比、格式化和语法检查',
    lightMode: '切换到亮色模式',
    darkMode: '切换到暗色模式',
    language: '语言',
    chinese: '中文',
    english: 'English',
    syntaxError: '语法错误',
    formatError: '格式化失败',
  },
  en: {
    title: 'Text Compare Tool',
    format: 'Format',
    viewMode: {
      sideBySide: 'Side by Side',
      inline: 'Inline',
    },
    swap: 'Swap',
    clear: 'Clear',
    compare: 'Compare',
    originalText: 'Original Text',
    newText: 'New Text',
    pasteOrUpload: 'Paste or enter original text...',
    pasteOrUploadNew: 'Paste or enter new text...',
    upload: 'Upload File',
    formatCode: 'Format',
    syntaxCheck: 'Syntax Check',
    copied: 'Copied',
    copy: 'Copy',
    syntaxValid: 'Valid Syntax',
    syntaxErrors: 'errors',
    diffResult: 'Compare Result',
    added: 'Added',
    removed: 'Removed',
    modified: 'Modified',
    export: 'Export',
    formats: {
      plaintext: 'Plain Text',
      json: 'JSON',
      xml: 'XML',
      html: 'HTML',
      yaml: 'YAML',
      shell: 'Shell',
      ini: 'INI',
    },
    startCompare: 'Start Comparing Text',
    emptyDescription: 'Paste or upload text in the input areas above, then click "Compare" to see the differences. Supports syntax checking and formatting for JSON, XML, HTML, YAML, Shell, INI and more.',
    footer: 'Text Compare Tool - Multi-format text comparison, formatting and syntax checking',
    lightMode: 'Switch to Light Mode',
    darkMode: 'Switch to Dark Mode',
    language: 'Language',
    chinese: '中文',
    english: 'English',
    syntaxError: 'Syntax Error',
    formatError: 'Format Failed',
  },
}

export function getTranslations(lang: Language): Translations {
  return translations[lang]
}
