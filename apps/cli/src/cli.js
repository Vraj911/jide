const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const { runCommand } = require('./commands/run.js');
const { checkCommand } = require('./commands/check.js');
const { buildCommand } = require('./commands/build.js');
const { astCommand } = require('./commands/ast.js');
const { fmtCommand } = require('./commands/fmt.js');

yargs(hideBin(process.argv))
    .scriptName('jpp')
    .usage('Usage: $0 <command> [options]')
    .command(
        'run <file>',
        'Compile and execute a J++ program',
        (y) => y.positional('file', { type: 'string' }),
        runCommand
    )
    .command(
        'check <file>',
        'Compile and type-check only',
        (y) => y.positional('file', { type: 'string' }),
        checkCommand
    )
    .command(
        'build <file>',
        'Compile to JavaScript',
        (y) =>
            y
                .positional('file', { type: 'string' })
                .option('out', {
                    alias: 'o',
                    type: 'string',
                    demandOption: true
                }),
        buildCommand
    )
    .command(
        'ast <file>',
        'Print the AST as JSON',
        (y) => y.positional('file', { type: 'string' }),
        astCommand
    )
    .command(
        'fmt <file>',
        'Format source code',
        (y) => y.positional('file', { type: 'string' }),
        fmtCommand
    )
    .demandCommand(1)
    .help()
    .strict()
    .parse();
