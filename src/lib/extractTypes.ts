import ts from 'typescript'

export type Properties = {
  name: string,
  type: string,
  description: string
  isOptional: boolean 
}

export function extractTypes(fileName: string, typeName: string) {
  const properties: Properties[] = []
  const program = ts.createProgram([fileName], {})
  const sourceFile = program.getSourceFile(fileName)
  
  if (!sourceFile) {
    console.error(`File ${fileName} not found.`)
    return
  }
  
  const checker = program.getTypeChecker()
  
  function getTextOfJSDocComment(comment?: string | ts.NodeArray<ts.JSDocComment>): string | undefined {
    if (!comment) return undefined
    if (typeof comment === 'string') return comment
    return comment.map(c => c.getText()).join(' ')
  }
  
  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) {
      node.members.forEach(member => {
        if (ts.isPropertySignature(member)) {
          const name = member.name.getText(sourceFile)
          const type = checker.typeToString(checker.getTypeAtLocation(member))
          const isOptional = !!member.questionToken
  
          const jsDocComment = ts.getJSDocCommentsAndTags(member).map(tag => getTextOfJSDocComment(tag.comment)).join(' ')
  
          properties.push({ name, type, description: jsDocComment, isOptional })
        }
      })
    }
  }
  
  ts.forEachChild(sourceFile, visit)
  return properties
}