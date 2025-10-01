import fs from 'fs'
import { parse } from 'acorn'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return m.reply(`❗️ أرسل اسم ملف البلوجن الذي تريد فحصه\nمثال:\n${usedPrefix}فحص plugin.js`)

  const path = `./plugins/${text}`
  if (!fs.existsSync(path)) return m.reply(`❌ الملف "${text}" غير موجود في مجلد plugins.`)

  const code = fs.readFileSync(path, 'utf-8')

  let report = []

  // تحليل الكود باستخدام acorn
  let ast
  try {
    ast = parse(code, { ecmaVersion: 2020, sourceType: 'module' })
    report.push('✅ الكود صالح من الناحية التركيبية (Syntax OK)')
  } catch (e) {
    return m.reply(`🚨 خطأ في تركيب الكود:\n${e.message}`)
  }

  // دوال لمساعدتنا بالبحث في AST
  const findExportDefaultHandler = (ast) => {
    return ast.body.some(node =>
      node.type === 'ExportDefaultDeclaration' &&
      ((node.declaration.type === 'Identifier' && node.declaration.name === 'handler') ||
      (node.declaration.type === 'FunctionDeclaration' && node.declaration.id.name === 'handler'))
    )
  }

  const findHandlerDeclaration = (ast) => {
    return ast.body.some(node =>
      (node.type === 'VariableDeclaration' &&
       node.declarations.some(d => d.id.name === 'handler')) ||
      (node.type === 'FunctionDeclaration' && node.id && node.id.name === 'handler')
    )
  }

  const findPropertyAssignment = (property) => {
    return ast.body.some(node => {
      if (node.type !== 'ExpressionStatement') return false
      const expr = node.expression
      if (expr.type !== 'AssignmentExpression') return false
      // مثل: handler.command = ...
      if (expr.left.type === 'MemberExpression' &&
          expr.left.object.name === 'handler' &&
          expr.left.property.name === property) return true
      return false
    })
  }

  const findIdentifiers = (name) => {
    let found = false
    const walk = (node) => {
      if (!node || found) return
      if (node.type === 'Identifier' && node.name === name) {
        found = true
        return
      }
      for (const key in node) {
        if (typeof node[key] === 'object' && node[key] !== null) {
          if (Array.isArray(node[key])) {
            node[key].forEach(walk)
          } else {
            walk(node[key])
          }
        }
      }
    }
    walk(ast)
    return found
  }

  // الآن نستخدم الدوال دي لفحص البلوجن
  if (findHandlerDeclaration(ast)) report.push('✅ يحتوي على تعريف الدالة handler')
  else report.push('🚨 لا يحتوي على تعريف الدالة handler')

  if (findPropertyAssignment('command')) report.push('✅ يحتوي على handler.command')
  else report.push('🚨 لا يحتوي على handler.command')

  if (findPropertyAssignment('owner') || findPropertyAssignment('rowner'))
    report.push('✅ يحتوي على handler.owner أو handler.rowner')
  else
    report.push('⚠️ لا يحتوي على handler.owner أو handler.rowner (قد يؤثر على صلاحيات المالك)')

  if (findExportDefaultHandler(ast)) report.push('✅ يحتوي على export default handler')
  else report.push('🚨 لا يحتوي على export default handler')

  // فحص المتغيرات الأساسية
  const varsToCheck = ['conn', 'm', 'args', 'command']
  varsToCheck.forEach(v => {
    if (findIdentifiers(v)) report.push(`✅ يحتوي على المتغير "${v}"`)
    else report.push(`⚠️ لا يحتوي على المتغير "${v}"`)
  })

  // إرسال التقرير
  await m.reply(`📋 تقرير فحص البلوجن "${text}":\n\n${report.join('\n')}`)
}

handler.help = ['2فحص']
handler.tags = ['owner']
handler.command = ['2فحص']
handler.owner = true

export default handler