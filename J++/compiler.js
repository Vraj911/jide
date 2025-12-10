const lexer = require('./lexer.js');
const parser = require('./parser.js');   
const generate = require('./generator.js');
const runner = require('./runner.js');
const code = require('./code.js');  
function compiler(input) {
    const tokens = lexer(input);
    const ast = parser(tokens);
    const executableCode = generate(ast);
    return executableCode;
}
const exec = compiler(code);
runner(exec);