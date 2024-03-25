
export function OK(data: object) {
    const res = {
        result: 'ok',
        data: data,
    }
    return Response.json(res)
}


export function Bad(message: string) {
    const res = {
        result: 'error',
        message,
    }
    return Response.json(res, {
        status: 400
    })
}