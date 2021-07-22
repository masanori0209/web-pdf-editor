let wasmAPI
const loadWasm = (async (context) => {
    const wasm = import("../../../../pkg")
    wasmAPI = await wasm
})
const calcNewPoint = (async (context, payload) => {
    if (wasmAPI == undefined) {
        await context.dispatch('loadWasm')
    }
    const newPoint = await wasmAPI.calc_point(JSON.stringify(payload.settings), payload.angle)
    context.commit("setPoint", {
        point: JSON.parse(newPoint),
    })
})