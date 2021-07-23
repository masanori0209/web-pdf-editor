const wasmAPI = import("/wasm/pkg")
const debugFunc = (async (context, payload) => {
    const newPoint = await wasmAPI.calc_point(
        JSON.stringify(payload.settings), payload.angle
    )
    return newPoint
})

export default {
    debugFunc
}