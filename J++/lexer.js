function lexer(input) {
    const tokens = [];
    let cursor = 0;
    while (cursor < input.length) {
        let char = input[cursor];
                if (/\s/.test(char)) {
            cursor++;
            continue;
        }
                if (char === '/' && cursor + 1 < input.length && input[cursor + 1] === '/') {
            while (cursor < input.length && input[cursor] !== '\n') {
                cursor++;
            }
            continue;
        }
                if (char === '/' && cursor + 1 < input.length && input[cursor + 1] === '*') {
            cursor += 2;
            while (cursor + 1 < input.length && !(input[cursor] === '*' && input[cursor + 1] === '/')) {
                cursor++;
            }
            cursor += 2;
            continue;
        }
if (input.slice(cursor).startsWith('nahi agar')) {
    tokens.push({ type: 'keyword', value: 'nahi agar' });
    cursor += 'nahi agar'.length;
    continue;
}

if (input.slice(cursor).startsWith('ke liye')) {
    const after = cursor + 'ke liye'.length;
    const boundaryOk =
        after >= input.length ||
        !/[a-zA-Z0-9_]/.test(input[after]);  
    if (boundaryOk) {
        tokens.push({ type: 'keyword', value: 'ke liye' });
        cursor = after;
        continue;
    }
}
        if (/[a-zA-Z_]/.test(char)) {
            let word = '';
            while (cursor < input.length && /[a-zA-Z0-9_]/.test(input[cursor])) {
                word += input[cursor];
                cursor++;
            }
const keywords = ['ye', 'bol', 'agar', 'nahi', 'jabtak', 'tak', 'break', 'continue'];
            if (keywords.includes(word)) {
                tokens.push({ type: 'keyword', value: word });
            } else {
                tokens.push({ type: 'identifier', value: word });
            }
            continue;
        }
                if (/[0-9]/.test(char)) {
            let num = '';
            while (cursor < input.length && /[0-9]/.test(input[cursor])) {
                num += input[cursor];
                cursor++;
            }
            tokens.push({ type: 'number', value: num });
            continue;
        }
                if (/[\+\-\*\/\=\<\>\!]/.test(char)) {
            if (char === '=' && cursor + 1 < input.length && input[cursor + 1] === '=') {
                tokens.push({ type: 'operator', value: '==' });
                cursor += 2;
            } else if (char === '<' && cursor + 1 < input.length && input[cursor + 1] === '=') {
                tokens.push({ type: 'operator', value: '<=' });
                cursor += 2;
            } else if (char === '>' && cursor + 1 < input.length && input[cursor + 1] === '=') {
                tokens.push({ type: 'operator', value: '>=' });
                cursor += 2;
            } else if (char === '!' && cursor + 1 < input.length && input[cursor + 1] === '=') {
                tokens.push({ type: 'operator', value: '!=' });
                cursor += 2;
            } else {
                tokens.push({ type: 'operator', value: char });
                cursor++;
            }
            continue;
        }
                if (char === '{' || char === '}') {
            tokens.push({ type: 'brace', value: char });
            cursor++;
            continue;
        }
                if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char });
            cursor++;
            continue;
        }
                cursor++;
    }
    return tokens;
}
module.exports = lexer;