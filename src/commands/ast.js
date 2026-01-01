const { readFile } = require('node:fs/promises');
const { formatErrors } = require('../errors.js');
const compile = require('../../lib/jpp/compiler.js');

async function astCommand(argv) {
    const source = await readFile(argv.file, 'utf8');
    const result = compile(source);

    if (!result.success) {
        console.error(
            'Cannot generate AST – compilation failed:\n' +
            formatErrors(result.errors)
        );
        process.exit(1);
    }

    console.log(JSON.stringify(result.ast, null, 2));
    process.exit(0);
}

module.exports = { astCommand };
