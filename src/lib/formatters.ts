import yaml from 'js-yaml'
import vkbeautify from 'vkbeautify'

export type FormatType = 'json' | 'xml' | 'html' | 'yaml' | 'shell' | 'ini' | 'plaintext'

export interface FormatResult {
  success: boolean
  formatted: string
  error?: string
}

export interface SyntaxCheckResult {
  valid: boolean
  errors: SyntaxError[]
}

export interface SyntaxError {
  line: number
  column: number
  message: string
}

/**
 * 格式化文本
 */
export function formatText(text: string, format: FormatType): FormatResult {
  try {
    switch (format) {
      case 'json':
        return formatJSON(text)
      case 'xml':
        return formatXML(text)
      case 'html':
        return formatHTML(text)
      case 'yaml':
        return formatYAML(text)
      case 'shell':
        return formatShell(text)
      case 'ini':
        return formatINI(text)
      case 'plaintext':
      default:
        return { success: true, formatted: text }
    }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 检查语法
 */
export function checkSyntax(text: string, format: FormatType): SyntaxCheckResult {
  switch (format) {
    case 'json':
      return checkJSON(text)
    case 'xml':
      return checkXML(text)
    case 'html':
      return checkHTML(text)
    case 'yaml':
      return checkYAML(text)
    case 'shell':
      return checkShell(text)
    case 'ini':
      return checkINI(text)
    case 'plaintext':
    default:
      return { valid: true, errors: [] }
  }
}

// JSON
function formatJSON(text: string): FormatResult {
  try {
    const parsed = JSON.parse(text)
    const formatted = JSON.stringify(parsed, null, 2)
    return { success: true, formatted }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: `JSON格式化失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

function checkJSON(text: string): SyntaxCheckResult {
  const errors: SyntaxError[] = []
  
  try {
    JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    // Try to extract line number from error message
    const lineMatch = message.match(/position\s+(\d+)/)
    let line = 1
    let column = 1
    
    if (lineMatch) {
      const position = parseInt(lineMatch[1])
      const lines = text.substring(0, position).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }
    
    errors.push({ line, column, message })
  }
  
  return { valid: errors.length === 0, errors }
}

// XML
function formatXML(text: string): FormatResult {
  try {
    const formatted = vkbeautify.xml(text, 2)
    return { success: true, formatted }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: `XML格式化失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

function checkXML(text: string): SyntaxCheckResult {
  const errors: SyntaxError[] = []
  
  // Basic XML validation
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')
  const parseError = doc.querySelector('parsererror')
  
  if (parseError) {
    const errorText = parseError.textContent || 'Unknown error'
    const lineMatch = errorText.match(/line\s+(\d+)/i)
    const colMatch = errorText.match(/column\s+(\d+)/i)
    
    errors.push({
      line: lineMatch ? parseInt(lineMatch[1]) : 1,
      column: colMatch ? parseInt(colMatch[1]) : 1,
      message: errorText,
    })
  }
  
  return { valid: errors.length === 0, errors }
}

// HTML
function formatHTML(text: string): FormatResult {
  try {
    const formatted = vkbeautify.xml(text, 2)
    return { success: true, formatted }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: `HTML格式化失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

function checkHTML(text: string): SyntaxCheckResult {
  const errors: SyntaxError[] = []
  
  // Basic HTML validation - check for matching tags
  const tagRegex = /<(\/?)([\w-]+)[^>]*>/g
  const tagStack: string[] = []
  let match
  let lineNumber = 1
  let lastIndex = 0
  
  while ((match = tagRegex.exec(text)) !== null) {
    // Count lines up to this match
    const textBefore = text.substring(lastIndex, match.index)
    lineNumber += (textBefore.match(/\n/g) || []).length
    lastIndex = match.index
    
    const [fullMatch, isClosing, tagName] = match
    
    // Skip self-closing tags
    if (fullMatch.endsWith('/>') || ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'].includes(tagName.toLowerCase())) {
      continue
    }
    
    if (isClosing) {
      if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName.toLowerCase()) {
        errors.push({
          line: lineNumber,
          column: 1,
          message: `未匹配的闭合标签: </${tagName}>`,
        })
      } else {
        tagStack.pop()
      }
    } else {
      tagStack.push(tagName.toLowerCase())
    }
  }
  
  tagStack.forEach(tag => {
    errors.push({
      line: text.split('\n').length,
      column: 1,
      message: `未闭合的标签: <${tag}>`,
    })
  })
  
  return { valid: errors.length === 0, errors }
}

// YAML
function formatYAML(text: string): FormatResult {
  try {
    const parsed = yaml.load(text)
    const formatted = yaml.dump(parsed, { 
      indent: 2, 
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    })
    return { success: true, formatted }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: `YAML格式化失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

function checkYAML(text: string): SyntaxCheckResult {
  const errors: SyntaxError[] = []
  
  try {
    yaml.load(text)
  } catch (error) {
    const yamlError = error as { mark?: { line?: number; column?: number }; reason?: string }
    errors.push({
      line: (yamlError.mark?.line ?? 0) + 1,
      column: (yamlError.mark?.column ?? 0) + 1,
      message: yamlError.reason || (error instanceof Error ? error.message : 'Unknown error'),
    })
  }
  
  return { valid: errors.length === 0, errors }
}

// Shell
function formatShell(text: string): FormatResult {
  try {
    // Basic shell script formatting
    const lines = text.split('\n')
    const formatted = lines
      .map(line => line.trimEnd())
      .join('\n')
    return { success: true, formatted }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: `Shell格式化失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

function checkShell(text: string): SyntaxCheckResult {
  const errors: SyntaxError[] = []
  const lines = text.split('\n')
  
  // Basic shell syntax checks
  let openQuotes = 0
  let openDoubleQuotes = 0
  let openBraces = 0
  let openBrackets = 0
  let openParentheses = 0
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Skip comments
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('#')) return
    
    // Check for unmatched quotes (simple check)
    let i = 0
    while (i < line.length) {
      const char = line[i]
      const prevChar = i > 0 ? line[i - 1] : ''
      
      if (char === "'" && prevChar !== '\\' && openDoubleQuotes === 0) {
        openQuotes = openQuotes === 0 ? 1 : 0
      }
      if (char === '"' && prevChar !== '\\' && openQuotes === 0) {
        openDoubleQuotes = openDoubleQuotes === 0 ? 1 : 0
      }
      
      i++
    }
    
    // Check for basic syntax issues
    if (trimmedLine.endsWith('&&') || trimmedLine.endsWith('||')) {
      // OK, continuation
    } else if (trimmedLine.endsWith('|') && !trimmedLine.includes('||')) {
      errors.push({
        line: lineNum,
        column: line.length,
        message: '管道符后缺少命令',
      })
    }
  })
  
  if (openQuotes !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: '未闭合的单引号',
    })
  }
  
  if (openDoubleQuotes !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: '未闭合的双引号',
    })
  }
  
  return { valid: errors.length === 0, errors }
}

// INI
function formatINI(text: string): FormatResult {
  try {
    const lines = text.split('\n')
    const formatted: string[] = []
    let currentSection = ''
    
    lines.forEach(line => {
      const trimmed = line.trim()
      
      if (trimmed === '') {
        formatted.push('')
      } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        // Section
        if (currentSection !== '') {
          formatted.push('') // Add blank line before section
        }
        formatted.push(trimmed)
        currentSection = trimmed
      } else if (trimmed.startsWith(';') || trimmed.startsWith('#')) {
        // Comment
        formatted.push(trimmed)
      } else if (trimmed.includes('=')) {
        // Key-value pair
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').trim()
        formatted.push(`${key.trim()} = ${value}`)
      } else {
        formatted.push(trimmed)
      }
    })
    
    return { success: true, formatted: formatted.join('\n') }
  } catch (error) {
    return {
      success: false,
      formatted: text,
      error: `INI格式化失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

function checkINI(text: string): SyntaxCheckResult {
  const errors: SyntaxError[] = []
  const lines = text.split('\n')
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    const trimmed = line.trim()
    
    // Check section syntax
    if (trimmed.startsWith('[')) {
      if (!trimmed.endsWith(']')) {
        errors.push({
          line: lineNum,
          column: 1,
          message: 'INI节未正确闭合',
        })
      } else if (!/^\[[\w\-.\s]+\]$/.test(trimmed)) {
        errors.push({
          line: lineNum,
          column: 1,
          message: 'INI节名称格式无效',
        })
      }
    }
  })
  
  return { valid: errors.length === 0, errors }
}

/**
 * 根据内容自动检测格式
 */
export function detectFormat(text: string): FormatType {
  const trimmed = text.trim()
  
  // JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Not valid JSON
    }
  }
  
  // XML or HTML
  if (trimmed.startsWith('<')) {
    if (trimmed.toLowerCase().startsWith('<!doctype html') || 
        trimmed.toLowerCase().startsWith('<html')) {
      return 'html'
    }
    return 'xml'
  }
  
  // YAML
  if (trimmed.includes(': ') && !trimmed.includes('=')) {
    try {
      yaml.load(trimmed)
      return 'yaml'
    } catch {
      // Not valid YAML
    }
  }
  
  // INI
  if (/^\[[\w\-.\s]+\]/m.test(trimmed) || /^[^=\[\]]+\s*=\s*.+/m.test(trimmed)) {
    return 'ini'
  }
  
  // Shell
  if (/^#!/.test(trimmed) || /\b(if|then|fi|for|do|done|case|esac|function)\b/.test(trimmed)) {
    return 'shell'
  }
  
  return 'plaintext'
}
