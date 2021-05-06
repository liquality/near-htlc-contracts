const sh = require('shelljs')
const fs = require('fs')

// Figure out which directory the user called this script from, which we'll use
// later to set up the symlink.
const calledFromDir = sh.pwd().toString()

// For the duration of this script, we want to operate from within the
// AssemblyScript project's folder. Let's change into that directory.
sh.cd(__dirname)

// You can call this script with `node compile.js` or `node compile.js --debug`.
// Let's set a variable to track whether `--debug` was used.
const debug = process.argv.pop() === '--debug'

// Use the correct build command based on the `--debug` flag
const buildCmd = debug ? 'npm run build:debug' : 'npm run build'

// Execute the build command, storing exit code for later use
const { code } = sh.exec(buildCmd)

// Assuming this is compiled from the root project directory, link the compiled
// contract to the `out` folder –
// When running commands like `near deploy`, near-cli looks for a contract at
// <CURRENT_DIRECTORY>/out/main.wasm
if (code === 0 && calledFromDir !== __dirname) {
  const packageName = require(`${__dirname}/package.json`).name
  const outFile = `./build/${debug ? 'debug' : 'release'}/${packageName}.wasm`
  const bytecode = fs.readFileSync(outFile)

  fs.writeFileSync(
    'bytecode.json',
    JSON.stringify(Buffer.from(bytecode).toJSON())
  )

  console.log('Bytecode generated inside bytecode.json')
}

// exit script with the same code as the build command
process.exit(code)
