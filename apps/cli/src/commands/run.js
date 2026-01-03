const { readFile } = require('node:fs/promises');
const { formatErrors } = require('../errors.js');
const compile = require('../../../../lib/jpp/compiler.js');
const vm = require('node:vm');

/**
 * jpp run <file.jpp>
 */
async function runCommand(argv) {
    try {
        const source = await readFile(argv.file, 'utf8');
        const result = compile(source);

        if (!result.success) {
            console.error('Compilation failed:\n' + formatErrors(result.errors));
            process.exit(1);
        }

        const context = vm.createContext({ console });
        const script = new vm.Script(result.code, {
            filename: argv.file + '.js'
        });

        const output = script.runInContext(context);
        if (output !== undefined) console.log(output);

        process.exit(0);
    } catch (err) {
        console.error('Runtime error:', err);
        process.exit(1);
    }
}

module.exports = { runCommand };
