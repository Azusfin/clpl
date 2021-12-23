import * as Types from "./Types"
import { HEX, INT } from "./Regexes"

export class ParserError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "CLPLError"
    }
}

export const enum ParserContexts {
    None,
    Value,
    SingleQuote,
    DoubleQuote
}

export const enum PairsContext {
    Pairs,
    ModifyPairs
}

export class ParserState {
    contexts: ParserContexts[] = [ParserContexts.None]
    annotations: Types.Annotations = new Map()
    pairsContexts: PairsContext[] = []
    pairs: Types.Pairs = new Map()
    annotationDepth: string[] = []
    depth: string[] = []
    chars: string[] = []
    annotation = false
    escape = false

    key?: string
}

export function parseData(clplData: string[][]): Types.Pairs {
    let lines = 1
    let column = 1

    const state = new ParserState()

    for (let l = 0; l < clplData.length; l++) {
        const line = clplData[l]

        let context = state.contexts[state.contexts.length - 1]

        const prevPair = getPair(state)

        if ((!prevPair || prevPair.block.type === 5 || prevPair.block.type === 0) && (state.key !== void 0 || context === ParserContexts.Value)) {
            throw new ParserError(`Value must be on the same line at ${lines - 1}:${column}`)
        }

        column = 1

        for (let i = 0; i < line.length; i++) {
            const word = line[i]

            if (!word.length) {
                column++

                if (!state.escape && (context === ParserContexts.SingleQuote || context === ParserContexts.DoubleQuote)) {
                    state.chars.push(" ")
                }

                continue
            }

            if (word.startsWith("#") && context !== ParserContexts.SingleQuote && context !== ParserContexts.DoubleQuote) break

            switch (context) {
                case ParserContexts.None:
                    {
                        if (state.key !== void 0) {
                            const topPair = getPair(state)
                            const pairs: Types.Pairs | Types.Annotations = topPair ? (topPair.block as Types.PairsBlock).value : getPairs(state)
                            const pair: Types.Pair | Types.Annotation | undefined = pairs.get(state.key)

                            getDepth(state).push(state.key)

                            switch (word) {
                                case "+":
                                    {
                                        let index = 0

                                        if (pair === void 0) {
                                            if (isPairs(state, pairs)) {
                                                pairs.set(state.key, {
                                                    annotations: new Map(state.annotations),
                                                    block: {
                                                        type: 4,
                                                        value: []
                                                    }
                                                })
                                                state.annotations.clear()
                                            } else pairs.set(state.key, {
                                                block: {
                                                    type: 4,
                                                    value: []
                                                }
                                            })
                                        } else if (pair.block.type !== 4) throw new ParserError(`Trying to add a value to a list but the pair isn't a list at ${lines}:${column}`)
                                        else {
                                            index = pair.block.value.length
                                        }

                                        const listPair = pairs.get(state.key)!

                                        if (isPair(state, listPair)) {
                                            (listPair.block as Types.ListBlock).value.push({
                                                annotations: new Map(state.annotations),
                                                block: {
                                                    type: 0
                                                }
                                            })
                                            state.annotations.clear()
                                        } else (listPair.block as Types.ListAnnotationBlock).value.push({
                                            block: {
                                                type: 0
                                            }
                                        })

                                        getDepth(state).push(index.toString())
                                        state.contexts.push(ParserContexts.Value)
                                    }
                                    break
                                case "=":
                                    {
                                        if (pair !== undefined) throw new ParserError(`Trying to assign a value but the pair is already assigned at ${lines}:${column}`)

                                        if (isPairs(state, pairs)) {
                                            pairs.set(state.key, {
                                                annotations: new Map(state.annotations),
                                                block: {
                                                    type: 0
                                                }
                                            })
                                            state.annotations.clear()
                                        } else pairs.set(state.key, {
                                            block: {
                                                type: 0
                                            }
                                        })

                                        state.contexts.push(ParserContexts.Value)
                                    }
                                    break
                                case ">":
                                    {
                                        if (pair === void 0) {
                                            if (isPairs(state, pairs)) {
                                                pairs.set(state.key, {
                                                    annotations: new Map(state.annotations),
                                                    block: {
                                                        type: 5,
                                                        value: new Map()
                                                    }
                                                })
                                                state.annotations.clear()
                                            } else pairs.set(state.key, {
                                                block: {
                                                    type: 5,
                                                    value: new Map()
                                                }
                                            })
                                        } else if (pair.block.type === 5 && isPair(state, pair)) {
                                            for (const [key, value] of state.annotations) {
                                                pair.annotations.set(key, value)
                                            }
                                            state.annotations.clear()
                                        } else throw new ParserError(`Trying to modify a pairs but the pair isn't a pairs type at ${lines}:${column}`)

                                        state.pairsContexts.push(PairsContext.ModifyPairs)
                                        state.contexts.push(ParserContexts.None)
                                    }
                                    break
                                default:
                                    throw new ParserError(`Unexpected token '${word}' at ${lines}:${column}`)
                            }

                            delete state.key
                        } else {
                            if (word.startsWith("@")) {
                                annotation(state, word, lines, column)
                            } else if (word === ")" || word === "<") {
                                const pairsContext = state.pairsContexts.pop()

                                if (word === ")" && pairsContext !== PairsContext.Pairs) throw new ParserError(`Unexpecting pairs closing with no pairs context at ${lines}:${column}`)
                                else if (word === "<" && pairsContext !== PairsContext.ModifyPairs) throw new ParserError(`Unexpecting modify-pairs closing with no modify-pairs context at ${lines}:${column}`)

                                if (state.annotations.size && !state.annotation) throw new ParserError(`Annotations pointing to nowhere at ${lines}:${column}`)

                                state.contexts.pop()
                                climbOut(state)
                            } else {
                                let key: string | undefined = word

                                if (word.startsWith("'")) {
                                    key = singleQuote(state, word.slice(1), lines, column)
                                    state.contexts[state.contexts.length - 1] = ParserContexts.SingleQuote
                                }

                                if (key !== undefined) {
                                    state.key = key
                                    state.contexts[state.contexts.length - 1] = ParserContexts.None
                                }
                            }
                        }
                    }
                    break
                case ParserContexts.Value:
                    {
                        const pair = getPair(state)

                        if (word.startsWith("@") && pair?.block.type === 4) {
                            annotation(state, word, lines, column)
                        } else if (word === "]") {

                            if (pair?.block.type !== 4) throw new ParserError(`Unexpected list closing on non-list context at ${lines}:${column}`)

                            state.contexts.pop()
                            climbOut(state)
                        } else {
                            const block = valueBlock(state, word, lines, column)

                            if (block !== void 0) {
                                const pairBlock = getPair(state)?.block
                                setBlock(state, block)

                                if (pairBlock?.type !== 4) {
                                    state.contexts.pop()
                                    climbOut(state)
                                } else {
                                    state.contexts[state.contexts.length - 1] = ParserContexts.Value
                                }
                            }
                        }
                    }
                    break
                case ParserContexts.SingleQuote:
                    {
                        const text = singleQuote(state, word, lines, column)

                        if (text !== void 0) {
                            const pair = getPair(state)

                            if ((pair === void 0 && !state.annotation) || pair?.block.type === 5) {
                                state.key = text
                                state.contexts[state.contexts.length - 1] = ParserContexts.None
                            } else {
                                const block = pair?.block
                                setBlock(state, {
                                    type: 3,
                                    value: text
                                })
                                if (block?.type !== 4) {
                                    state.contexts.pop()
                                    climbOut(state)
                                } else {
                                    state.contexts[state.contexts.length - 1] = ParserContexts.Value
                                }
                            }
                        }
                    }
                    break
                case ParserContexts.DoubleQuote:
                    {
                        const text = doubleQuote(state, word, lines, column)

                        if (text !== void 0) {
                            const block = getPair(state)?.block
                            setBlock(state, {
                                type: 3,
                                value: text
                            })
                            if (block?.type !== 4) {
                                state.contexts.pop()
                                climbOut(state)
                            } else {
                                state.contexts[state.contexts.length - 1] = ParserContexts.Value
                            }
                        }
                    }
                    break
            }

            context = state.contexts[state.contexts.length - 1]
            column += word.length

            if (i < line.length - 1) {
                if (!state.escape && (context === ParserContexts.SingleQuote || context === ParserContexts.DoubleQuote)) {
                    state.chars.push(" ")
                }

                column++
            }
        }

        if (l < clplData.length - 1) {
            lines++
        }
    }

    if (state.annotations.size) throw new ParserError(`Annotations pointing to nowhere at ${lines}:${column}`)
    if (state.key !== void 0) throw new ParserError(`Pair not assigned at ${lines}:${column}`)
    if (state.contexts.length > 1) {
        const context = state.contexts[state.contexts.length - 1]

        switch (context) {
            case ParserContexts.None:
                {
                    const pairsContext = state.pairsContexts[state.pairsContexts.length - 1]

                    if (pairsContext === PairsContext.Pairs) throw new ParserError(`Pairs is not closed at ${lines}:${column}`)
                    else throw new ParserError(`Modify pairs is not closed at ${lines}:${column}`)
                }
            case ParserContexts.Value:
                {
                    const pair = getPair(state)!

                    if (pair.block.type === 4) throw new ParserError(`List is not closed at ${lines}:${column}`)
                    else throw new ParserError(`Pair is missing value at ${lines}:${column}`)
                }
            case ParserContexts.SingleQuote:
            case ParserContexts.DoubleQuote:
                throw new ParserError(`Text is not closed at ${lines}:${column}`)
        }
    }

    return state.pairs
}

function annotation(state: ParserState, word: string, lines: number, column: number): void {
    if (state.annotation) throw new ParserError(`Cannot parse annotations inside annotations at ${lines}:${column}`)

    const annotationSplit = word.split("=")
    const annotationName = annotationSplit.shift()!.slice(1)

    if (!annotationName.length) throw new ParserError(`Annotation with no name at ${lines}:${column + 1}`)

    let block: Types.Block | undefined = {
        type: 0
    }

    if (annotationSplit.length) {
        state.annotation = true
        state.annotations.set(annotationName, { block })
        state.annotationDepth.push(annotationName)
        state.contexts.push(ParserContexts.Value)

        const annotationValue = annotationSplit.join("=")
        block = valueBlock(state, annotationValue, lines, column + 1 + annotationName.length + 1)
    }

    if (block !== undefined) {
        const annotation = { block }

        state.annotations.set(annotationName, annotation)

        if (annotationSplit.length) {
            state.contexts.pop()
            climbOut(state)
        }
    }
}

function getPairs(state: ParserState): Types.Pairs | Types.Annotations {
    return state.annotation ? state.annotations : state.pairs
}

function getDepth(state: ParserState): string[] {
    return state.annotation ? state.annotationDepth : state.depth
}

function getPair(state: ParserState): Types.Pair | Types.Annotation | undefined {
    const depth = getDepth(state)
    const pairs = getPairs(state)

    let pair!: Types.Pair | Types.Annotation

    for (const key of depth) {
        if (pair === void 0) {
            pair = pairs.get(key)!
            continue
        }

        pair = pair.block.type === 5
            ? pair.block.value.get(key)
            : pair.block.type === 4
                ? pair.block.value[key]
                : void 0

        if (pair === void 0) {
            throw new ParserError(`Unexpected non-pairs-or-list block while getting pair`)
        }
    }

    return pair
}

function climbOut(state: ParserState): void {
    const pair = getPair(state)!
    
    getDepth(state).pop()
    
    const outer = getPair(state)
    const context = state.contexts[state.contexts.length - 1]

    if (outer && outer.block.type === 4 && pair.block.type !== 4 && context !== ParserContexts.Value) getDepth(state).pop()

    if (!getDepth(state).length && state.annotation) state.annotation = false
}

function blockList(state: ParserState, list: Types.Pair[] | Types.Annotation[]): list is Types.Pair[] {
    return !state.annotation
}

function isPairs(state: ParserState, pairs: Types.Pairs | Types.Annotations): pairs is Types.Pairs {
    return !state.annotation
}

function isPair(state: ParserState, pair: Types.Pair | Types.Annotation): pair is Types.Pair {
    return !state.annotation
}

export function setBlock(state: ParserState, block: Types.Block): void {
    const pair = getPair(state)!

    if (pair.block.type === 4) {
        if (blockList(state, pair.block.value)) {
            pair.block.value.push({
                annotations: new Map(state.annotations),
                block
            })
            state.annotations.clear()
        } else pair.block.value.push({ block })
    } else {
        pair.block = block
    }
}

export function valueBlock(state: ParserState, word: string, lines: number, column: number): Types.Block | undefined {
    if (word === "none") {
        return {
            type: 0
        }
    } else if (word === "yes" || word === "no") {
        return {
            type: 1,
            value: word === "yes"
        }
    } else if (word[0] === "-" || !isNaN(parseInt(word[0]))) {
        if (word.endsWith("n")) {
            const numbers = word[0] === "-" ? word.slice(1, -1) : word.slice(0, -1)
            const splits = numbers.split("_")

            if (!splits[splits.length - 1].length) throw new ParserError(`Trailing separator on bigint at ${lines}:${column}`)

            const number = splits.join("")

            if (!INT.test(number)) throw new ParserError(`Invalid bigint at ${lines}:${column}`)

            const bigint = BigInt(number)

            return {
                type: 6,
                value: word[0] === "-" ? -bigint : bigint
            }
        }

        const numbers = word[0] === "-" ? word.slice(1) : word
        const splitDecimals = numbers.split(".")

        if (splitDecimals.length > 2) throw new ParserError(`Number with more than one '.' decimals at ${lines}:${column}`)

        const splitsIntegers = splitDecimals[0].split("_")

        if (!splitsIntegers[splitsIntegers.length - 1].length) throw new ParserError(`Trailing separator on number integers at ${lines}:${column}`)

        let splitsDecimals: string[] | undefined

        if (splitDecimals.length > 1) {
            splitsDecimals = splitDecimals[1].split("_")

            if (!splitsDecimals[0].length) throw new ParserError(`Leading separator on number decimals at ${lines}:${column}`)
            if (!splitsDecimals[splitsDecimals.length - 1].length) throw new ParserError(`Trailing separator on number decimals at ${lines}:${column}`)
        }

        const integers = splitsIntegers.join("")
        const decimals = splitsDecimals?.join("")

        if (!INT.test(integers)) throw new ParserError(`Invalid number integers at ${lines}:${column}`)
        if (decimals && !INT.test(decimals)) throw new ParserError(`Invalid number decimals at ${lines}:${column}`)

        const number = `${integers}${decimals ? `.${decimals}` : ""}`
        const float = parseFloat(number)

        return {
            type: 2,
            value: word[0] === "-" ? -float : float
        }
    } else if (word.startsWith("'")) {
        const text = singleQuote(state, word.slice(1), lines, column)

        if (text !== void 0) return {
            type: 3,
            value: text
        }

        state.contexts[state.contexts.length - 1] = ParserContexts.SingleQuote
    } else if (word.startsWith('"')) {
        const text = doubleQuote(state, word.slice(1), lines, column)

        if (text !== void 0) return {
            type: 3,
            value: text
        }

        state.contexts[state.contexts.length - 1] = ParserContexts.DoubleQuote
    } else if (word === "[" || word === "[]") {
        const listBlock: Types.ListBlock = {
            type: 4,
            value: []
        }

        if (word === "[]") return listBlock

        const pair = getPair(state)!
        const { block } = pair

        setBlock(state, listBlock)

        if (block.type === 4) {
            getDepth(state).push((block.value.length - 1).toString())
            state.contexts.push(ParserContexts.Value)
        }
    } else if (word === "(" || word === "()") {
        const pairsBlock: Types.PairsBlock = {
            type: 5,
            value: new Map()
        }

        if (word === "()") return pairsBlock

        const pair = getPair(state)!
        const { block } = pair

        setBlock(state, pairsBlock)

        if (block.type === 4) {
            getDepth(state).push((block.value.length - 1).toString())
            state.contexts.push(ParserContexts.None)
        } else {
            state.contexts[state.contexts.length - 1] = ParserContexts.None
        }

        state.pairsContexts.push(PairsContext.Pairs)
    } else throw new ParserError(`Unexpected word '${word}' while parsing value at ${lines}:${column}`)
}

export function singleQuote(state: ParserState, word: string, lines: number, column: number): string | undefined {
    state.escape = false

    let start = 0

    for (let i = 0; i < word.length; i++) {
        const char = word[i]

        if (state.escape) {
            switch (char) {
                case "'":
                    state.chars.push("'")
                    break
                default:
                    state.chars.push(`\\${char}`)
            }

            state.escape = false
            start = i + 1
        } else {
            switch (char) {
                case "'":
                    {
                        if (start < i) state.chars.push(word.slice(start, i))

                        const text = state.chars.join("")
                        state.chars.length = 0

                        const rem = word.slice(i + 1)

                        if (rem.length) throw new ParserError(`Unexpected word '${rem}' while parsing string at ${lines}:${column + i}`)

                        return text
                    }
                case "\\":
                    if (start < i) state.chars.push(word.slice(start, i))
                    state.escape = true
                    start = i + 1
                    break
            }
        }
    }

    if (start < word.length) state.chars.push(word.slice(start))
}

export function doubleQuote(state: ParserState, word: string, lines: number, column: number): string | undefined {
    state.escape = false

    let start = 0
    let unicodes: string[] | undefined

    for (let i = 0; i < word.length; i++) {
        const char = word[i]

        if (state.escape) {
            switch (char) {
                case "'":
                    state.chars.push("'")
                    break
                case '"':
                    state.chars.push('"')
                    break
                case "\\":
                    state.chars.push("\\")
                    break
                case "n":
                    state.chars.push("\n")
                    break
                case "r":
                    state.chars.push("\r")
                    break
                case "t":
                    state.chars.push("\t")
                    break
                case "b":
                    state.chars.push("\b")
                    break
                case "f":
                    state.chars.push("\f")
                    break
                case "v":
                    state.chars.push("\v")
                    break
                case "u":
                    unicodes = []
                    break
                default:
                    throw new ParserError(`Unsupported escape character '\\${char}' at ${lines}:${column + i}`)
            }

            state.escape = false
            start = i + 1
        } else if (unicodes !== void 0) {
            if (!HEX.test(char)) throw new ParserError(`Unexpected non-hex character '${char}' while getting unicode hex at ${lines}:${column + i}`)

            unicodes.push(char)

            if (unicodes.length === 4) {
                const hex = unicodes.join("")
                const num = parseInt(hex, 16)
                const unicode = String.fromCodePoint(num)

                start = i + 1
                unicodes = void 0
                state.chars.push(unicode)
            }
        } else {
            switch (char) {
                case '"':
                    {
                        if (start < i) state.chars.push(word.slice(start, i))

                        const text = state.chars.join("")
                        state.chars.length = 0

                        const rem = word.slice(i + 1)

                        if (rem.length) throw new ParserError(`Unexpected word '${rem}' while parsing string at ${lines}:${column + i}`)

                        return text
                    }
                case "\\":
                    if (start < i) state.chars.push(word.slice(start, i))
                    state.escape = true
                    start = i + 1
                    break
            }
        }
    }

    if (unicodes !== void 0) throw new ParserError(`Expecting 4 hexadecimal characters, but got only '${unicodes.length}' at ${lines}:${column + word.length}`)
    if (start < word.length) state.chars.push(word.slice(start))
}
