import * as Types from "./Types"

export function transformPairs<O extends boolean = false>(
    pairs: Types.Pairs,
    transformer: (pair: Types.Pair, object: boolean) => unknown,
    object: O = false as O
): O extends true ? Record<string, unknown> : Map<string, unknown> {
    const obj = (
        object
            ? {} as Record<string, unknown>
            : new Map<string, unknown>()
    ) as O extends true
        ? Record<string, unknown>
        : Map<string, unknown>

    for (const [key, pair] of pairs.entries()) {
        const transformed = transformer(pair, object)

        if (obj instanceof Map) obj.set(key, transformed)
        else obj[key] = transformed
    }

    return obj
}

export function defaultTransformer(pair: Types.Pair, object: boolean): unknown {
    switch (pair.block.type) {
        case 0:
            return null
        case 1:
        case 2:
        case 3:
        case 6:
            return pair.block.value
        case 4:
            {
                const list: unknown[] = []

                for (let i = 0; i < pair.block.value.length; i++) {
                    const valuePair = pair.block.value[i]
                    const value = defaultTransformer(valuePair, object)

                    list.push(value)
                }

                return list
            }
        case 5:
            return transformPairs(
                pair.block.value,
                defaultTransformer,
                object
            )
    }
}
