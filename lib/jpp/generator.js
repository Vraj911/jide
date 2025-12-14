/**
 * J++ Code Generator - Converts AST to JavaScript
 * 
 * STRICT OPERATOR GENERATION:
 * - + generates: (left + right) - but type checker ensures both are numbers
 * - . generates: (String(left) + String(right)) - but type checker ensures both are strings
 */
 function generate(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(generate).join('\n');
    case 'Declaration':
      return `let ${node.name} = ${generateValue(node.value)};`;
    case 'Assignment':
      return `${node.name} = ${generateValue(node.value)};`;
    case 'PrintStatement':
      return `console.log(${generateValue(node.value)});`;
    case 'IfStatement':
      let ifCode = `if (${generateCondition(node.condition)}) {\n  ${node.body.map(generate).join('\n  ')}\n}`;
      if (node.elseIf && node.elseIf.length > 0) {
        for (let elseIfBlock of node.elseIf) {
          ifCode += ` else if (${generateCondition(elseIfBlock.condition)}) {\n  ${elseIfBlock.body.map(generate).join('\n  ')}\n}`;
        }
      }
      if (node.elseBody && node.elseBody.length > 0) {
        ifCode += ` else {\n  ${node.elseBody.map(generate).join('\n  ')}\n}`;
      }
      return ifCode;
    case 'WhileStatement':
      return `while (${generateCondition(node.condition)}) {\n  ${node.body.map(generate).join('\n  ')}\n}`;
    case 'ForStatement':
      return `for (let ${node.variable} = ${generateValue(node.start)}; ${node.variable} < ${generateValue(node.end)}; ${node.variable}++) {\n  ${node.body.map(generate).join('\n  ')}\n}`;
    case 'BreakStatement':
      return 'break;';
    case 'ContinueStatement':
      return 'continue;';
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}
function generateValue(node) {
  if (node === null || node === undefined) {
    return '0';
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (typeof node === 'string') {
    return `"${node}"`;
  }
  switch (node.type) {
    case 'Number':
      return String(node.value);
    case 'String':
      const escaped = node.value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
      return `"${escaped}"`;
    case 'Identifier':
      return node.value;
    case 'BinaryOp':
      // +, -, *, / - all numeric operations
      // Type checker ensures operands are numbers
      return `(${generateValue(node.left)} ${node.operator} ${generateValue(node.right)})`;
    case 'ConcatOp':
      // . operator - string concatenation
      // Type checker ensures operands are strings
      // Generate: (String(left) + String(right))
      // Note: Since type checker guarantees strings, we can use direct + in JS
      return `(${generateValue(node.left)} + ${generateValue(node.right)})`;
    default:
      throw new Error(`Cannot generate code for node type: ${node.type}`);
  }
}
function generateCondition(condition) {
  return `${generateValue(condition.left)} ${condition.operator} ${generateValue(condition.right)}`;
}
module.exports = generate;