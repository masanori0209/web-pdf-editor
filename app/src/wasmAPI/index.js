const wasmAPI = import("../../../../pkg")
const calcNewPoint = (async (context, payload) => {
    const newPoint = await wasmAPI.calc_point(
        JSON.stringify(payload.settings), payload.angle
    )
    context.commit("setPoint", {
        point: JSON.parse(newPoint),
    })
})