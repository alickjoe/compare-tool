import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
  ArrowRightLeft, 
  FileUp, 
  Trash2, 
  Play, 
  Code2, 
  CheckCircle2, 
  AlertCircle,
  Moon,
  Sun,
  Copy,
  Check,
  RefreshCw,
  Download,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { 
  computeDiff, 
  computeSideBySideDiff, 
  type DiffLine, 
  type SideBySideLine
} from '@/lib/diff'
import { 
  formatText, 
  checkSyntax, 
  detectFormat,
  type FormatType, 
  type SyntaxCheckResult
} from '@/lib/formatters'
import { 
  getTranslations, 
  type Language
} from '@/lib/i18n'

type ViewMode = 'side-by-side' | 'inline'

function App() {
  // State
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [format, setFormat] = useState<FormatType>('plaintext')
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [showDiff, setShowDiff] = useState(false)
  const [diffResult, setDiffResult] = useState<ReturnType<typeof computeDiff> | null>(null)
  const [sideBySideResult, setSideBySideResult] = useState<SideBySideLine[]>([])
  const [leftSyntaxResult, setLeftSyntaxResult] = useState<SyntaxCheckResult>({ valid: true, errors: [] })
  const [rightSyntaxResult, setRightSyntaxResult] = useState<SyntaxCheckResult>({ valid: true, errors: [] })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isFormatting, setIsFormatting] = useState<'left' | 'right' | null>(null)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved === 'zh' || saved === 'en') ? saved : 'zh'
  })
  
  // Get translations
  const t = getTranslations(language)
  
  // Format options with translations
  const formatOptions = [
    { value: 'plaintext', label: t.formats.plaintext },
    { value: 'json', label: t.formats.json },
    { value: 'xml', label: t.formats.xml },
    { value: 'html', label: t.formats.html },
    { value: 'yaml', label: t.formats.yaml },
    { value: 'shell', label: t.formats.shell },
    { value: 'ini', label: t.formats.ini },
  ]
  
  // Refs
  const leftFileInputRef = useRef<HTMLInputElement>(null)
  const rightFileInputRef = useRef<HTMLInputElement>(null)
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null)
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Auto-detect format
  useEffect(() => {
    if (leftText || rightText) {
      const detected = detectFormat(leftText || rightText)
      if (detected !== 'plaintext') {
        setFormat(detected)
      }
    }
  }, [leftText, rightText])

  // File upload handler
  const handleFileUpload = useCallback((side: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (side === 'left') {
          setLeftText(content)
        } else {
          setRightText(content)
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  }, [])

  // Clear handler
  const handleClear = useCallback(() => {
    setLeftText('')
    setRightText('')
    setShowDiff(false)
    setDiffResult(null)
    setSideBySideResult([])
    setLeftSyntaxResult({ valid: true, errors: [] })
    setRightSyntaxResult({ valid: true, errors: [] })
  }, [])

  // Swap handler
  const handleSwap = useCallback(() => {
    const temp = leftText
    setLeftText(rightText)
    setRightText(temp)
    const tempSyntax = leftSyntaxResult
    setLeftSyntaxResult(rightSyntaxResult)
    setRightSyntaxResult(tempSyntax)
    if (showDiff) {
      handleCompare(rightText, leftText)
    }
  }, [leftText, rightText, leftSyntaxResult, rightSyntaxResult, showDiff])

  // Compare handler
  const handleCompare = useCallback((left = leftText, right = rightText) => {
    if (!left && !right) return
    
    const diff = computeDiff(left, right)
    const sideBySide = computeSideBySideDiff(left, right)
    
    setDiffResult(diff)
    setSideBySideResult(sideBySide)
    setShowDiff(true)
  }, [leftText, rightText])

  // Format handler
  const handleFormat = useCallback((side: 'left' | 'right') => {
    const text = side === 'left' ? leftText : rightText
    if (!text) return
    
    setIsFormatting(side)
    
    setTimeout(() => {
      const result = formatText(text, format)
      
      if (result.success) {
        if (side === 'left') {
          setLeftText(result.formatted)
        } else {
          setRightText(result.formatted)
        }
      } else {
        alert(`${t.formatError}: ${result.error}`)
      }
      
      setIsFormatting(null)
    }, 100)
  }, [leftText, rightText, format, t.formatError])

  // Syntax check handler
  const handleSyntaxCheck = useCallback((side: 'left' | 'right') => {
    const text = side === 'left' ? leftText : rightText
    if (!text) return
    
    const result = checkSyntax(text, format)
    
    if (side === 'left') {
      setLeftSyntaxResult(result)
    } else {
      setRightSyntaxResult(result)
    }
    
    if (!result.valid && result.errors.length > 0) {
      const error = result.errors[0]
      alert(`${t.syntaxError} (line ${error.line}, col ${error.column}): ${error.message}`)
    }
  }, [leftText, rightText, format, t.syntaxError])

  // Copy handler
  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  // Download diff result
  const handleDownloadDiff = useCallback(() => {
    if (!diffResult) return
    
    const content = diffResult.lines.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
      return `${prefix} ${line.content}`
    }).join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diff-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [diffResult])

  // Toggle language
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }, [])

  // Render syntax error indicator
  const renderSyntaxIndicator = (result: SyntaxCheckResult) => {
    if (result.valid) {
      return (
        <div className="flex items-center gap-1 text-diff-add text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t.syntaxValid}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-destructive text-xs">
        <AlertCircle className="w-4 h-4" />
        <span>{result.errors.length} {t.syntaxErrors}</span>
      </div>
    )
  }

  // Render diff line for inline mode
  const renderInlineDiffLine = (line: DiffLine) => {
    const lineClass = cn(
      'diff-line',
      line.type === 'added' && 'diff-line-add',
      line.type === 'removed' && 'diff-line-remove',
      line.type === 'modified' && 'diff-line-change'
    )

    return (
      <div key={line.lineNumber} className={lineClass}>
        <div className="flex items-center">
          <span className="line-number">{line.oldLineNumber || ''}</span>
          <span className="line-number">{line.newLineNumber || ''}</span>
          <span className={cn(
            'w-6 text-center font-mono text-xs',
            line.type === 'added' && 'text-diff-add',
            line.type === 'removed' && 'text-diff-remove',
            line.type === 'modified' && 'text-diff-change'
          )}>
            {line.type === 'added' && '+'}
            {line.type === 'removed' && '-'}
            {line.type === 'modified' && '~'}
            {line.type === 'unchanged' && ' '}
          </span>
          <span className="flex-1 font-mono text-sm whitespace-pre-wrap break-all">
            {line.content}
          </span>
        </div>
      </div>
    )
  }

  // Render side-by-side diff
  const renderSideBySideDiff = () => {
    return (
      <div className="grid grid-cols-2 gap-0 divide-x divide-border">
        {/* Left side */}
        <div className="overflow-auto custom-scrollbar">
          <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 border-b text-sm font-medium">
            {t.originalText}
          </div>
          {sideBySideResult.map((line, idx) => (
            <div 
              key={`left-${idx}`} 
              className={cn(
                'flex items-start min-h-6',
                line.leftType === 'removed' && 'bg-diff-removeBg',
                line.leftType === 'added' && 'bg-diff-addBg'
              )}
            >
              <span className="line-number shrink-0">
                {line.leftLineNumber || ''}
              </span>
              <span className={cn(
                'w-6 text-center font-mono text-xs shrink-0',
                line.leftType === 'removed' && 'text-diff-remove',
                line.leftType === 'added' && 'text-diff-add'
              )}>
                {line.leftType === 'removed' && '-'}
                {line.leftType === 'added' && '+'}
              </span>
              <span className="font-mono text-sm whitespace-pre-wrap break-all px-2">
                {line.leftContent || ''}
              </span>
            </div>
          ))}
        </div>
        
        {/* Right side */}
        <div className="overflow-auto custom-scrollbar">
          <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 border-b text-sm font-medium">
            {t.newText}
          </div>
          {sideBySideResult.map((line, idx) => (
            <div 
              key={`right-${idx}`} 
              className={cn(
                'flex items-start min-h-6',
                line.rightType === 'added' && 'bg-diff-addBg',
                line.rightType === 'removed' && 'bg-diff-removeBg'
              )}
            >
              <span className="line-number shrink-0">
                {line.rightLineNumber || ''}
              </span>
              <span className={cn(
                'w-6 text-center font-mono text-xs shrink-0',
                line.rightType === 'added' && 'text-diff-add',
                line.rightType === 'removed' && 'text-diff-remove'
              )}>
                {line.rightType === 'added' && '+'}
                {line.rightType === 'removed' && '-'}
              </span>
              <span className="font-mono text-sm whitespace-pre-wrap break-all px-2">
                {line.rightContent || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Stats
  const stats = diffResult ? {
    added: diffResult.addedLines,
    removed: diffResult.removedLines,
    modified: diffResult.modifiedLines,
    unchanged: diffResult.unchangedLines,
  } : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Tooltip content={language === 'zh' ? t.english : t.chinese}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </Tooltip>
            
            {/* Theme toggle */}
            <Tooltip content={isDarkMode ? t.lightMode : t.darkMode}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="container py-4 md:py-6 px-4">
        {/* Toolbar */}
        <Card className="mb-4">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Format selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">{t.format}:</span>
                <Select
                  options={formatOptions}
                  value={format}
                  onChange={(e) => setFormat(e.target.value as FormatType)}
                  className="w-28 md:w-32"
                />
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                <Toggle
                  pressed={viewMode === 'side-by-side'}
                  onPressedChange={() => setViewMode('side-by-side')}
                  label={t.viewMode.sideBySide}
                  className="h-8 px-3 text-xs"
                />
                <Toggle
                  pressed={viewMode === 'inline'}
                  onPressedChange={() => setViewMode('inline')}
                  label={t.viewMode.inline}
                  className="h-8 px-3 text-xs"
                />
              </div>

              <div className="flex-1" />

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Tooltip content={t.swap}>
                  <Button variant="outline" size="sm" onClick={handleSwap}>
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{t.swap}</span>
                  </Button>
                </Tooltip>
                
                <Tooltip content={t.clear}>
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{t.clear}</span>
                  </Button>
                </Tooltip>
                
                <Tooltip content={t.compare}>
                  <Button size="sm" onClick={() => handleCompare()}>
                    <Play className="h-4 w-4 mr-1" />
                    {t.compare}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Left input */}
          <Card className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.originalText}</CardTitle>
                <div className="flex items-center gap-2">
                  {renderSyntaxIndicator(leftSyntaxResult)}
                  <input
                    ref={leftFileInputRef}
                    type="file"
                    accept=".txt,.json,.xml,.html,.yaml,.yml,.sh,.ini,.config"
                    onChange={handleFileUpload('left')}
                    className="hidden"
                  />
                  <Tooltip content={t.upload}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => leftFileInputRef.current?.click()}
                    >
                      <FileUp className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t.formatCode}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleFormat('left')}
                      disabled={isFormatting === 'left'}
                    >
                      <RefreshCw className={cn("h-4 w-4", isFormatting === 'left' && "animate-spin")} />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t.syntaxCheck}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSyntaxCheck('left')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={copiedField === 'left' ? t.copied : t.copy}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopy(leftText, 'left')}
                    >
                      {copiedField === 'left' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                ref={leftTextareaRef}
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                placeholder={t.pasteOrUpload}
                className="min-h-[250px] md:min-h-[350px] border-0 rounded-none focus-visible:ring-0"
                error={!leftSyntaxResult.valid}
              />
            </CardContent>
          </Card>

          {/* Right input */}
          <Card className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.newText}</CardTitle>
                <div className="flex items-center gap-2">
                  {renderSyntaxIndicator(rightSyntaxResult)}
                  <input
                    ref={rightFileInputRef}
                    type="file"
                    accept=".txt,.json,.xml,.html,.yaml,.yml,.sh,.ini,.config"
                    onChange={handleFileUpload('right')}
                    className="hidden"
                  />
                  <Tooltip content={t.upload}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => rightFileInputRef.current?.click()}
                    >
                      <FileUp className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t.formatCode}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleFormat('right')}
                      disabled={isFormatting === 'right'}
                    >
                      <RefreshCw className={cn("h-4 w-4", isFormatting === 'right' && "animate-spin")} />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t.syntaxCheck}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleSyntaxCheck('right')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={copiedField === 'right' ? t.copied : t.copy}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleCopy(rightText, 'right')}
                    >
                      {copiedField === 'right' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                ref={rightTextareaRef}
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                placeholder={t.pasteOrUploadNew}
                className="min-h-[250px] md:min-h-[350px] border-0 rounded-none focus-visible:ring-0"
                error={!rightSyntaxResult.valid}
              />
            </CardContent>
          </Card>
        </div>

        {/* Diff result */}
        {showDiff && diffResult && (
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">{t.diffResult}</CardTitle>
                <div className="flex items-center gap-4">
                  {/* Stats */}
                  {stats && (
                    <div className="flex items-center gap-3 text-sm">
                      {stats.added > 0 && (
                        <span className="flex items-center gap-1 text-diff-add">
                          <span className="w-2 h-2 rounded-full bg-diff-add" />
                          +{stats.added} {t.added}
                        </span>
                      )}
                      {stats.removed > 0 && (
                        <span className="flex items-center gap-1 text-diff-remove">
                          <span className="w-2 h-2 rounded-full bg-diff-remove" />
                          -{stats.removed} {t.removed}
                        </span>
                      )}
                      {stats.modified > 0 && (
                        <span className="flex items-center gap-1 text-diff-change">
                          <span className="w-2 h-2 rounded-full bg-diff-change" />
                          ~{stats.modified} {t.modified}
                        </span>
                      )}
                    </div>
                  )}
                  <Tooltip content={t.export}>
                    <Button variant="outline" size="sm" onClick={handleDownloadDiff}>
                      <Download className="h-4 w-4 mr-1" />
                      {t.export}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-auto custom-scrollbar border-t">
                {viewMode === 'side-by-side' ? (
                  renderSideBySideDiff()
                ) : (
                  <div className="divide-y divide-border">
                    {diffResult.lines.map(renderInlineDiffLine)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!showDiff && !leftText && !rightText && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Code2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.startCompare}</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t.emptyDescription}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="container text-center text-sm text-muted-foreground px-4">
          {t.footer}
        </div>
      </footer>
    </div>
  )
}

export default App
