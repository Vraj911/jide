const { readFile, writeFile } = require('node:fs/promises');
const { formatErrors } = require('../errors.js');
const compile = require('../../../../lib/jpp/compiler.js');

/**
 * jpp build <file.jpp> --out <file.js>
 *   • Compile the J++ source to JavaScript.
 *   • Write the generated code to the specified output file.
 *   • Exit 0 on success, 1 on compilation error.
 */
async function buildCommand(argv) {
    const source = await readFile(argv.file, 'utf8');
    const result = compile(source);

    if (!result.success) {
        console.error('Compilation failed:\n' + formatErrors(result.errors));
        process.exit(1);
    }

    await writeFile(argv.out, result.code, 'utf8');
    console.log(`✅ Built ${argv.out}`);
    process.exit(0);
}

module.exports = { buildCommand };
