import * as Diff from 'diff'

export type DiffType = 'added' | 'removed' | 'unchanged' | 'modified'

export interface DiffLine {
  lineNumber: number
  oldLineNumber?: number
  newLineNumber?: number
  content: string
  type: DiffType
  oldContent?: string
  newContent?: string
}

export interface DiffResult {
  lines: DiffLine[]
  addedLines: number
  removedLines: number
  modifiedLines: number
  unchangedLines: number
}

export interface InlineDiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

/**
 * 计算两个文本之间的差异
 */
export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  const diffResult = Diff.diffLines(oldText, newText)
  
  const lines: DiffLine[] = []
  let oldLineNum = 0
  let newLineNum = 0
  let addedLines = 0
  let removedLines = 0
  let modifiedLines = 0
  let unchangedLines = 0

  diffResult.forEach((part) => {
    const partLines = part.value.split('\n')
    // Remove last empty line if the part ends with newline
    if (partLines[partLines.length - 1] === '') {
      partLines.pop()
    }

    partLines.forEach((line) => {
      if (part.added) {
        newLineNum++
        lines.push({
          lineNumber: lines.length + 1,
          newLineNumber: newLineNum,
          content: line,
          type: 'added',
          newContent: line,
        })
        addedLines++
      } else if (part.removed) {
        oldLineNum++
        lines.push({
          lineNumber: lines.length + 1,
          oldLineNumber: oldLineNum,
          content: line,
          type: 'removed',
          oldContent: line,
        })
        removedLines++
      } else {
        oldLineNum++
        newLineNum++
        lines.push({
          lineNumber: lines.length + 1,
          oldLineNumber: oldLineNum,
          newLineNumber: newLineNum,
          content: line,
          type: 'unchanged',
        })
        unchangedLines++
      }
    })
  })

  // Detect modified lines (removed followed by added)
  const processedLines = detectModifiedLines(lines)
  
  // Recalculate counts after modification detection
  let actualAdded = 0
  let actualRemoved = 0
  let actualModified = 0
  let actualUnchanged = 0
  
  processedLines.forEach(line => {
    switch (line.type) {
      case 'added': actualAdded++; break
      case 'removed': actualRemoved++; break
      case 'modified': actualModified++; break
      case 'unchanged': actualUnchanged++; break
    }
  })

  return {
    lines: processedLines,
    addedLines: actualAdded,
    removedLines: actualRemoved,
    modifiedLines: actualModified,
    unchangedLines: actualUnchanged,
  }
}

/**
 * 检测修改的行（连续的删除和添加行合并为修改）
 */
function detectModifiedLines(lines: DiffLine[]): DiffLine[] {
  const result: DiffLine[] = []
  let i = 0

  while (i < lines.length) {
    const current = lines[i]
    
    // Check if this is a potential modification (removed line followed by added line)
    if (current.type === 'removed') {
      const removedGroup: DiffLine[] = [current]
      let j = i + 1
      
      // Collect consecutive removed lines
      while (j < lines.length && lines[j].type === 'removed') {
        removedGroup.push(lines[j])
        j++
      }
      
      const addedGroup: DiffLine[] = []
      // Collect consecutive added lines
      while (j < lines.length && lines[j].type === 'added') {
        addedGroup.push(lines[j])
        j++
      }
      
      // If we have both removed and added lines, treat as modification
      if (addedGroup.length > 0) {
        const maxLen = Math.max(removedGroup.length, addedGroup.length)
        
        for (let k = 0; k < maxLen; k++) {
          const removedLine = removedGroup[k]
          const addedLine = addedGroup[k]
          
          if (removedLine && addedLine) {
            // Create a modified line with both old and new content
            result.push({
              lineNumber: result.length + 1,
              oldLineNumber: removedLine.oldLineNumber,
              newLineNumber: addedLine.newLineNumber,
              content: `${removedLine.content} → ${addedLine.content}`,
              type: 'modified',
              oldContent: removedLine.content,
              newContent: addedLine.content,
            })
          } else if (removedLine) {
            // Extra removed line
            result.push({
              ...removedLine,
              lineNumber: result.length + 1,
              type: 'removed',
            })
          } else if (addedLine) {
            // Extra added line
            result.push({
              ...addedLine,
              lineNumber: result.length + 1,
              type: 'added',
            })
          }
        }
        
        i = j
        continue
      }
    }
    
    result.push({
      ...current,
      lineNumber: result.length + 1,
    })
    i++
  }

  return result
}

/**
 * 计算行内差异（字符级别的差异）
 */
export function computeInlineDiff(oldLine: string, newLine: string): InlineDiffPart[] {
  const diff = Diff.diffChars(oldLine, newLine)
  return diff.map(part => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
  }))
}

/**
 * 生成并排对比数据
 */
export interface SideBySideLine {
  lineNumber: number
  leftLineNumber?: number
  rightLineNumber?: number
  leftContent?: string
  rightContent?: string
  leftType: DiffType
  rightType: DiffType
  leftInlineDiff?: InlineDiffPart[]
  rightInlineDiff?: InlineDiffPart[]
}

export function computeSideBySideDiff(oldText: string, newText: string): SideBySideLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: SideBySideLine[] = []
  
  const diffResult = Diff.diffLines(oldText, newText)
  
  let leftLineNum = 0
  let rightLineNum = 0
  let resultLineNum = 0
  
  // Process diff parts
  const processedParts: Array<{
    type: 'removed' | 'added' | 'unchanged'
    lines: string[]
  }> = []
  
  diffResult.forEach(part => {
    const lines = part.value.split('\n')
    if (lines[lines.length - 1] === '') {
      lines.pop()
    }
    
    if (part.added) {
      processedParts.push({ type: 'added', lines })
    } else if (part.removed) {
      processedParts.push({ type: 'removed', lines })
    } else {
      processedParts.push({ type: 'unchanged', lines })
    }
  })
  
  // Merge consecutive removed+added into modifications
  let i = 0
  while (i < processedParts.length) {
    const current = processedParts[i]
    
    if (current.type === 'removed' && i + 1 < processedParts.length && processedParts[i + 1].type === 'added') {
      const removedLines = current.lines
      const addedLines = processedParts[i + 1].lines
      const maxLen = Math.max(removedLines.length, addedLines.length)
      
      for (let j = 0; j < maxLen; j++) {
        const removedLine = removedLines[j]
        const addedLine = addedLines[j]
        
        resultLineNum++
        leftLineNum++
        rightLineNum++
        
        result.push({
          lineNumber: resultLineNum,
          leftLineNumber: removedLine ? leftLineNum - (removedLines.length - 1 - j) : undefined,
          rightLineNumber: addedLine ? rightLineNum - (addedLines.length - 1 - j) : undefined,
          leftContent: removedLine || '',
          rightContent: addedLine || '',
          leftType: removedLine ? 'removed' : 'unchanged',
          rightType: addedLine ? 'added' : 'unchanged',
        })
      }
      
      i += 2
    } else if (current.type === 'removed') {
      current.lines.forEach(line => {
        resultLineNum++
        leftLineNum++
        result.push({
          lineNumber: resultLineNum,
          leftLineNumber: leftLineNum,
          leftContent: line,
          leftType: 'removed',
          rightType: 'unchanged',
        })
      })
      i++
    } else if (current.type === 'added') {
      current.lines.forEach(line => {
        resultLineNum++
        rightLineNum++
        result.push({
          lineNumber: resultLineNum,
          rightLineNumber: rightLineNum,
          rightContent: line,
          leftType: 'unchanged',
          rightType: 'added',
        })
      })
      i++
    } else {
      current.lines.forEach(line => {
        resultLineNum++
        leftLineNum++
        rightLineNum++
        result.push({
          lineNumber: resultLineNum,
          leftLineNumber: leftLineNum,
          rightLineNumber: rightLineNum,
          leftContent: line,
          rightContent: line,
          leftType: 'unchanged',
          rightType: 'unchanged',
        })
      })
      i++
    }
  }
  
  // Recalculate line numbers properly
  let actualLeftLine = 0
  let actualRightLine = 0
  
  return result.map(line => {
    if (line.leftContent !== undefined && line.leftType !== 'unchanged') {
      actualLeftLine++
    }
    if (line.rightContent !== undefined && line.rightType !== 'unchanged') {
      actualRightLine++
    }
    if (line.leftType === 'unchanged' && line.rightType === 'unchanged') {
      actualLeftLine++
      actualRightLine++
    }
    
    return {
      ...line,
      leftLineNumber: line.leftContent !== undefined ? 
        (line.leftType === 'unchanged' ? actualLeftLine : line.leftLineNumber) : undefined,
      rightLineNumber: line.rightContent !== undefined ? 
        (line.rightType === 'unchanged' ? actualRightLine : line.rightLineNumber) : undefined,
    }
  })
}
