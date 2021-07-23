let wasmAPI
const load = (async () => {
    const wasm = import("../../wasm/pkg")
    wasmAPI = await wasm
})
if (wasmAPI == undefined) {
    load()
}
const debugFunc = (async (context, payload) => {
    console.log(wasmAPI)
    const newPoint = await wasmAPI.greet()
    return newPoint
})

export default debugFunc