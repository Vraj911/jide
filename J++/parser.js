const keywords = ['ye', 'bol', 'agar', 'nahi', 'jabtak', 'ke liye', 'tak', 'break', 'continue'];
function parser(tokens) {
    const ast = {
        type: 'Program',
        body: []
    };
    const tokenCopy = [...tokens];
    while (tokenCopy.length > 0) {
        let stmt = parseStatement(tokenCopy, false);
        if (stmt) ast.body.push(stmt);
    }
    return ast;
}
function parseStatement(tokens, insideLoop = false) {
    if (tokens.length === 0) return null;
    const token = tokens[0];
    if (token.type === 'keyword' && token.value === 'ye') {
        return parseDeclaration(tokens);
    } else if (token.type === 'keyword' && token.value === 'bol') {
        return parsePrintStatement(tokens);
    } else if (token.type === 'keyword' && token.value === 'agar') {
        return parseIfStatement(tokens,insideLoop);
    } else if (token.type === 'keyword' && token.value === 'jabtak') {
        return parseWhileStatement(tokens);
    } else if (token.type === 'keyword' && token.value === 'ke liye') {
        return parseForStatement(tokens);
    } else if (token.type === 'keyword' && token.value === 'break') {
        if (!insideLoop) throw new Error('break/continue outside loop');
        tokens.shift();
        return { type: 'BreakStatement' };
    } else if (token.type === 'keyword' && token.value === 'continue') {
        if (!insideLoop) throw new Error('break/continue outside loop');
        tokens.shift();
        return { type: 'ContinueStatement' };
    } else if (token.type === 'identifier') {
        return parseAssignment(tokens);
    }
    tokens.shift();
    return null;
}
function parseDeclaration(tokens) {
    tokens.shift(); 
    if (tokens.length === 0 || tokens[0].type !== 'identifier') {
        throw new Error('Expected identifier after "ye"');
    }
    const name = tokens.shift().value;
    let value = null;
    if (tokens.length > 0 && tokens[0].type === 'operator' && tokens[0].value === '=') {
        tokens.shift(); 
        value = parseExpression(tokens);
    }
    return { type: 'Declaration', name, value };
}
function parseAssignment(tokens) {
    const name = tokens.shift().value;
    if (tokens.length === 0 || tokens[0].type !== 'operator' || tokens[0].value !== '=') {
        throw new Error(`Expected "=" after identifier "${name}"`);
    }
    tokens.shift(); 
    const value = parseExpression(tokens);
    return { type: 'Assignment', name, value };
}
function parsePrintStatement(tokens) {
    tokens.shift(); 
    if (tokens.length === 0) throw new Error('Expected value after "bol"');
    const value = parseExpression(tokens);
    return { type: 'PrintStatement', value };
}
function parseIfStatement(tokens, insideLoop = false) {
    tokens.shift();
    const condition = parseCondition(tokens);

    if (tokens.length === 0 || tokens[0].type !== 'brace' || tokens[0].value !== '{') {
        throw new Error('Expected "{" after condition');
    }
    tokens.shift(); 
    const body = parseBlock(tokens, insideLoop);  
    const elseIf = [];
    let elseBody = null;
   while (tokens.length > 0 && 
      (tokens[0].value === 'nahi agar' || tokens[0].value === 'nahi')) {
    if (tokens[0].value === 'nahi agar') {
        tokens.shift(); 
        const elifCondition = parseCondition(tokens);
        if (tokens.length === 0 || tokens[0].value !== '{') throw new Error('Expected "{" after else-if');
        tokens.shift();
        const elifBody = parseBlock(tokens, insideLoop);
        elseIf.push({ condition: elifCondition, body: elifBody });
        continue;
    }

    if (tokens[0].value === 'nahi') {
        tokens.shift(); 
        if (tokens.length === 0 || tokens[0].value !== '{') throw new Error('Expected "{" after nahi');
        tokens.shift();
        elseBody = parseBlock(tokens, insideLoop);
        break;
    }
      }
    return {
        type: 'IfStatement',
        condition,
        body,
        elseIf,
        elseBody
    };
}
function parseWhileStatement(tokens) {
    tokens.shift(); 
    const condition = parseCondition(tokens);
    if (tokens.length === 0 || tokens[0].type !== 'brace' || tokens[0].value !== '{') {
        throw new Error('Expected "{" after condition');
    }
    tokens.shift(); 
    const body = parseBlock(tokens, true);
    return { type: 'WhileStatement', condition, body };
}
function parseForStatement(tokens) {
    tokens.shift(); 
    if (tokens.length === 0 || tokens[0].type !== 'identifier') {
        throw new Error('Expected identifier in for loop');
    }
    const variable = tokens.shift().value;
    if (tokens.length === 0 || tokens[0].type !== 'operator' || tokens[0].value !== '=') {
        throw new Error('Expected "=" in for loop');
    }
    tokens.shift(); 
    const start = parseExpression(tokens);
    if (tokens.length === 0 || !(tokens[0].type === 'keyword' && tokens[0].value === 'tak')) {
        throw new Error('Expected "tak" in for loop');
    }
    tokens.shift(); 
    const end = parseExpression(tokens);
    if (tokens.length === 0 || tokens[0].type !== 'brace' || tokens[0].value !== '{') {
        throw new Error('Expected "{" after for condition');
    }
    tokens.shift();
    const body = parseBlock(tokens, true);
    return { type: 'ForStatement', variable, start, end, body };
}
function parseCondition(tokens) {
    const left = parseExpression(tokens);
    if (tokens.length === 0 || tokens[0].type !== 'operator' || !isComparisonOperator(tokens[0].value)) {
        throw new Error('Expected comparison operator in condition');
    }
    const operator = tokens.shift().value;
    const right = parseExpression(tokens);
    return { left, operator, right };
}
function isComparisonOperator(op) {
    return ['==', '!=', '<', '>', '<=', '>='].includes(op);
}
function parseExpression(tokens) {
    return parseAdditive(tokens);
}
function parseAdditive(tokens) {
    let left = parseMultiplicative(tokens);
    while (tokens.length > 0 && tokens[0].type === 'operator' && (tokens[0].value === '+' || tokens[0].value === '-')) {
        const op = tokens.shift().value;
        const right = parseMultiplicative(tokens);
        left = { type: 'BinaryOp', left, operator: op, right };
    }
    return left;
}
function parseMultiplicative(tokens) {
    let left = parsePrimary(tokens);
    while (tokens.length > 0 && tokens[0].type === 'operator' && (tokens[0].value === '*' || tokens[0].value === '/')) {
        const op = tokens.shift().value;
        const right = parsePrimary(tokens);
        left = { type: 'BinaryOp', left, operator: op, right };
    }
    return left;
}
function parsePrimary(tokens) {
    if (tokens.length === 0) throw new Error('Unexpected end of expression');
    const token = tokens[0];

    if (token.type === 'paren' && token.value === '(') {
        tokens.shift(); 
        const expr = parseExpression(tokens);
        if (tokens.length === 0 || tokens[0].type !== 'paren' || tokens[0].value !== ')') {
            throw new Error('Expected ")" after expression');
        }
        tokens.shift(); 
        return expr;
    }
    if (token.type === 'number') {
        tokens.shift();
        return { type: 'Number', value: parseInt(token.value, 10) };
    }
    if (token.type === 'identifier') {
        tokens.shift();
        return { type: 'Identifier', value: token.value };
    }

    throw new Error(`Unexpected token: ${token.value}`);
}
function parseBlock(tokens, insideLoop = false) {
    const body = [];
    while (tokens.length > 0) {
        if (tokens[0].type === 'brace' && tokens[0].value === '}') {
            tokens.shift(); 
            break;
        }
        const stmt = parseStatement(tokens, insideLoop);
        if (stmt) body.push(stmt);
    }
    return body;
}
module.exports = parser;