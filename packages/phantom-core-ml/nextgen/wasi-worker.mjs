import fs from 'node:fs'
import { createRequire } from 'node:module'
import { parse } from 'node:path'
import { WASI } from 'node:wasi'
import { parentPort } from 'node:worker_threads'

const require = createRequire(import.meta.url)
const { instantiateNapiModuleSync, MessageHandler, getDefaultContext } = require('@napi-rs/wasm-runtime')

const rootDir = parse(process.cwd()).root

const handler = new MessageHandler({
  onLoad({ wasmModule, wasmMemory }) {
    const wasi = new WASI({
      version: 'preview1',
      env: process.env,
      preopens: {
        [rootDir]: rootDir,
      },
    })
    return instantiateNapiModuleSync(wasmModule, {
      childThread: true,
      context: getDefaultContext(),
      wasi,
      overwriteImports(importObject) {
        importObject.env = {
          ...importObject.env,
          ...importObject.napi,
          ...importObject.emnapi,
          memory: wasmMemory,
        }
      },
    })
  },
})

parentPort.on('message', (data) => {
  handler.handle(data, {}, fs)
})