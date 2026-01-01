const { readFile } = require('node:fs/promises');
const { formatErrors } = require('../errors.js');
const compile = require('../../lib/jpp/compiler.js');

/**
 * jpp check <file.jpp>
 *   • Compile the J++ source and run type-checking only.
 */
async function checkCommand(argv) {
    const source = await readFile(argv.file, 'utf8');
    const result = compile(source);

    if (!result.success) {
        console.error('Type-check errors:\n' + formatErrors(result.errors));
        process.exit(1);
    }

    console.log('✅ No type-checking errors.');
    process.exit(0);
}

module.exports = { checkCommand };
