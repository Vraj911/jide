const { readFile, writeFile } = require('node:fs/promises');
const { formatErrors } = require('../errors.js');
const compile = require('../../lib/jpp/compiler.js');

async function fmtCommand(argv) {
    const source = await readFile(argv.file, 'utf8');

    const result = compile(source);
    if (!result.success) {
        console.error(
            'Formatting failed – parsing error:\n' +
            formatErrors(result.errors)
        );
        process.exit(1);
    }

    // no-op formatter for now
    await writeFile(argv.file, source, 'utf8');
    console.log('✅ Formatted');
    process.exit(0);
}

module.exports = { fmtCommand };
