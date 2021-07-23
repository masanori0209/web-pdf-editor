const wasmAPI = import("../../wasm/pkg")
const debugFunc = (async (context, payload) => {
    const newPoint = await wasmAPI.greet()
    return newPoint
})

export default {
    debugFunc
}