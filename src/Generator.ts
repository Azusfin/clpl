import * as Types from "./Types"

export type ReferencesStack = Set<Map<string, unknown> | Record<string, unknown> | unknown[]>

export class GeneratorError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "CLPLError"
    }
}

export function genPairs(
    obj: Map<string, unknown> | Record<string, unknown>,
    generator: (value: unknown, stack: ReferencesStack) => Types.Pair,
    stack: ReferencesStack
): Types.Pairs {
    const pairs: Types.Pairs = new Map()

    stack.add(obj)

    if (obj instanceof Map) {
        for (const [key, value] of obj.entries()) {
            if (value === void 0) continue

            genPair(obj, generator, stack, pairs, key, value)
        }
    } else {
        const keys = Object.keys(obj)

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value = obj[key]

            if (value === void 0) continue

            genPair(obj, generator, stack, pairs, key, value)
        }
    }

    stack.delete(obj)

    return pairs
}

export function defaultGenerator(value: unknown, stack: ReferencesStack): Types.Pair {
    switch (typeof value) {
        case "boolean":
            return {
                annotations: new Map(),
                block: {
                    type: 1,
                    value
                }
            }
        case "number":
            return {
                annotations: new Map(),
                block: {
                    type: 2,
                    value
                }
            }
        case "string":
            return {
                annotations: new Map(),
                block: {
                    type: 3,
                    value
                }
            }
        case "bigint":
            return {
                annotations: new Map(),
                block: {
                    type: 6,
                    value
                }
            }
        case "object":
            {
                if (value === null) return {
                    annotations: new Map(),
                    block: {
                        type: 0
                    }
                }
                else if (Array.isArray(value)) {
                    const list: Types.Pair[] = []

                    stack.add(value)

                    for (let i = 0; i < value.length; i++) {
                        const val = value[i]

                        if (val === void 0) continue
                        if (stack.has(val)) {
                            stack.delete(value)
                            throw new GeneratorError(`Circular reference at ${i}`)
                        }

                        let pair: Types.Pair

                        try {
                            pair = defaultGenerator(val, stack)
                        } catch (err) {
                            stack.delete(value)
                            throw forwardError(err, i.toString())
                        }

                        list.push(pair)
                    }

                    stack.delete(value)

                    return {
                        annotations: new Map(),
                        block: {
                            type: 4,
                            value: list
                        }
                    }
                } else {
                    const pairs = genPairs(value as Record<string, unknown>, defaultGenerator, stack)

                    return {
                        annotations: new Map(),
                        block: {
                            type: 5,
                            value: pairs
                        }
                    }
                }
            }
        default:
            throw new GeneratorError(`Unsupported type '${typeof value}'`)
    }
}

export function forwardError(err: GeneratorError, at: string): GeneratorError {
    const split = err.message.split("at")
    const msg = split.shift()?.trim()
    const higherAt = split.length ? split.join("at").trim() : void 0

    const message = `${msg} ${
        higherAt
            ? `at ${at} -> ${higherAt}`
            : `at ${at}`
    }`

    return new GeneratorError(message)
}

function genPair(
    obj: Map<string, unknown> | Record<string, unknown>,
    generator: (value: unknown, stack: ReferencesStack) => Types.Pair,
    stack: ReferencesStack,
    pairs: Types.Pairs,
    key: string,
    value: unknown
): void {
    if (stack.has(value as any)) {
        stack.delete(obj)
        throw new GeneratorError(`Circular reference at '${key}'`)
    }

    let pair: Types.Pair

    try {
        pair = generator(value, stack)
    } catch (err) {
        stack.delete(obj)
        throw forwardError(err, `'${key}'`)
    }

    pairs.set(key, pair)
}
