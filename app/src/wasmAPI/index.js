let wasmAPI
const load = (async () => {
    const wasm = import("../../wasm/pkg")
    wasmAPI = await wasm
})
if (wasmAPI == undefined) {
    load()
}
const debugFunc = (async () => {
    console.log('start debugFunc')
    const res = await wasmAPI.greet()
    console.log('end debugFunc', res)
    return res
})
const fileUploadView = (async (parameter) => {
    console.log('start fileUploadView', parameter)
    const res = await wasmAPI.fileUploadView()
    console.log('end fileUploadView', res)
    return res
})

export default {
    debugFunc,
    fileUploadView
}