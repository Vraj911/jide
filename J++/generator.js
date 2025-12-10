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
        case 'Identifier':
            return node.value;
        case 'BinaryOp':
            return `(${generateValue(node.left)} ${node.operator} ${generateValue(node.right)})`;
        default:
            return String(node);
    }
}
function generateCondition(condition) {
    return `${generateValue(condition.left)} ${condition.operator} ${generateValue(condition.right)}`;
}
module.exports = generate;