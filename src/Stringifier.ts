import * as Types from "./Types"
import { NEWLINE } from "./Regexes"
import graphemeSplit from "graphemesplit"

const CHUNK_LIMIT = 75

export class StringifyError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "CLPLError"
    }
}

export class StringifyState {
    indent: number
    spaces: string
    level = 0

    chars: string[] = []

    constructor(indent: number) {
        this.indent = indent
        this.spaces = " ".repeat(this.indent)
    }

    indentLine(): void {
        if (this.indent) {
            const spaces = this.spaces.repeat(this.level)
            this.chars.push(`\n${spaces}`)
        } else this.chars.push(" ")
    }

    levelUp(): void {
        if (this.indent) this.level++
    }

    levelDown(): void {
        if (this.indent) this.level--
    }
}

export function stringifyPair(pair: Types.Pair, state: StringifyState, key?: string, indent = true): void {
    if (pair.annotations.size) {
        for (const [name, annotation] of pair.annotations) {
            if (
                name.includes(" ") ||
                name.includes("=") ||
                NEWLINE.test(name)
            ) throw new StringifyError(`Annotation name may not contain '=', space, or newline inside ${
                typeof key === "string"
                    ? `key '${key}' -> annotation '${name}'`
                    : `annotation '${name}'`
            }`)

            if (annotation.block.type === 0) {
                state.chars.push(`@${name}`)
                state.indentLine()
                continue
            }

            state.chars.push(`@${name}=`)

            try {
                stringifyAnnotation(annotation, state)
            } catch (err) {
                throw forwardError(
                    err,
                    typeof key === "string"
                        ? `key '${key}' -> annotation '${name}'`
                        : `annotation '${name}'`
                )
            }

            state.indentLine()
        }
    }

    if (typeof key === "string") {
        if (NEWLINE.test(key)) throw new StringifyError(`Key name must not contain any newline inside key '${key}'`)

        if (
            key.startsWith("#") ||
            key.startsWith("@") ||
            key.includes(" ")
        ) {
            state.chars.push(`'${key.split("'").join("\\'")}' = `)
        } else state.chars.push(`${key} = `)
    }

    try {
        switch (pair.block.type) {
            case 0:
                state.chars.push("none")
                break
            case 1:
                stringifyBoolean(pair.block, state)
                break
            case 2:
                stringifyNumber(pair.block, state)
                break
            case 3:
                stringifyText(pair.block, state)
                break
            case 6:
                stringifyBigInt(pair.block, state)
                break
            case 4:
                stringifyList(pair.block.value, state)
                break
            case 5:
                stringifyPairs(pair.block.value, state)
        }
    } catch (err) {
        if (typeof key !== "string") throw err
        else throw forwardError(err, `key '${key}'`)
    }

    if (indent) state.indentLine()
}

export function stringifyAnnotation(annotation: Types.Annotation, state: StringifyState, key?: string): void {
    if (typeof key === "string") {
        if (NEWLINE.test(key)) throw new StringifyError(`Key name must not contain any newline inside key '${key}'`)

        if (
            key.startsWith("#") ||
            key.startsWith("@") ||
            key.includes(" ")
        ) {
            state.chars.push(`'${key}' = `)
        } else state.chars.push(`${key} = `)
    }

    try {
        switch (annotation.block.type) {
            case 1:
                stringifyBoolean(annotation.block, state)
                break
            case 2:
                stringifyNumber(annotation.block, state)
                break
            case 3:
                stringifyText(annotation.block, state)
                break
            case 6:
                stringifyBigInt(annotation.block, state)
                break
            case 4:
                stringifyListAnnotation(annotation.block.value, state)
                break
            case 5:
                stringifyAnnotations(annotation.block.value, state)
        }
    } catch (err) {
        if (typeof key !== "string") throw err
        else throw forwardError(err, `key '${key}'`)
    }
}

export function stringifyBoolean(block: Types.BooleanBlock, state: StringifyState): void {
    state.chars.push(`${block.value ? "yes" : "no"}`)
}

export function stringifyNumber(block: Types.NumberBlock, state: StringifyState): void {
    const num = block.value.toString()
    state.chars.push(num)
}

export function stringifyText(block: Types.TextBlock, state: StringifyState): void {
    const chars = graphemeSplit(block.value)
    const splittedTexts: string[][] = []

    let start = 0
    let chunks = 0
    let line = 0

    for (let i = 0; i < chars.length; i++) {
        if (splittedTexts.length === line) splittedTexts.push([])

        const char = chars[i]

        switch (char) {
            case '"':
            case "\\":
            case "\n":
            case "\r":
            case "\t":
            case "\b":
            case "\f":
            case "\v":
                {
                    if (start < i) {
                        splittedTexts[line].push(
                            chars.slice(start, i).join("")
                        )
                    }

                    let escaped: string

                    switch (char) {
                        case '"':
                            escaped = '\\"'
                            break
                        case "\\":
                            escaped = "\\\\"
                            break
                        case "\n":
                            escaped = "\\n"
                            break
                        case "\r":
                            escaped = "\\r"
                            break
                        case "\t":
                            escaped = "\\t"
                            break
                        case "\b":
                            escaped = "\\b"
                            break
                        case "\f":
                            escaped = "\\f"
                            break
                        case "\v":
                            escaped = "\\v"
                    }

                    splittedTexts[line].push(escaped)

                    chunks += 2
                    start = i + 1
                }
                break
            default:
                chunks++
        }

        if (chunks > CHUNK_LIMIT && i < chars.length - 1) {
            if (start <= i) {
                splittedTexts[line].push(
                    chars.slice(start, i + 1).join("")
                )
            }

            if (state.indent) {
                splittedTexts[line].push("\\")
                line++
            }

            chunks = 0
            start = i + 1
        }
    }

    if (start < chars.length) {
        splittedTexts[line].push(
            chars.slice(start).join("")
        )
    }

    state.levelUp()
    state.chars.push('"')

    for (let i = 0; i < splittedTexts.length; i++) {
        const splittedText = splittedTexts[i]
        const text = splittedText.join("")

        state.chars.push(text)

        if (i < splittedTexts.length - 1) state.indentLine()
    }

    state.chars.push('"')
    state.levelDown()
}

export function stringifyBigInt(block: Types.BigIntBlock, state: StringifyState): void {
    const bigint = block.value
    state.chars.push(`${bigint}n`)
}

export function stringifyList(pairs: Types.Pair[], state: StringifyState): void {
    if (!pairs.length) {
        state.chars.push("[]")
        return
    }

    state.levelUp()
    state.chars.push("[")

    state.indentLine()

    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i]

        try {
            stringifyPair(pair, state, void 0, false)
        } catch (err) {
            throw forwardError(err, `index ${i}`)
        }

        if (i < pairs.length - 1) state.indentLine()
    }

    state.levelDown()
    state.indentLine()
    state.chars.push("]")
}

export function stringifyListAnnotation(annotations: Types.Annotation[], state: StringifyState): void {
    if (!annotations.length) {
        state.chars.push("[]")
        return
    }

    state.levelUp()
    state.chars.push("[")

    state.indentLine()

    for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i]

        try {
            stringifyAnnotation(annotation, state)
        } catch (err) {
            throw forwardError(err, `index ${i}`)
        }

        if (i < annotations.length - 1) state.indentLine()
    }

    state.levelDown()
    state.indentLine()
    state.chars.push("]")
}

export function stringifyPairs(pairs: Types.Pairs, state: StringifyState, topLevel = false): void {
    if (!pairs.size) {
        if (!topLevel) state.chars.push("()")
        return
    }

    if (!topLevel) {
        state.levelUp()
        state.chars.push("(")
        state.indentLine()
    }

    const lastKey = Array.from(pairs.keys()).pop()

    for (const [key, pair] of pairs) {
        stringifyPair(pair, state, key, topLevel)
        if (!topLevel && lastKey !== key) state.indentLine()
    }

    if (!topLevel) {
        state.levelDown()
        state.indentLine()
        state.chars.push(")")
    }
}

export function stringifyAnnotations(annotations: Types.Annotations, state: StringifyState): void {
    if (!annotations.size) {
        state.chars.push("()")
        return
    }

    state.levelUp()
    state.chars.push("(")

    state.indentLine()

    const lastKey = Array.from(annotations.keys()).pop()

    for (const [key, annotation] of annotations) {
        stringifyAnnotation(annotation, state, key)
        if (lastKey !== key) state.indentLine()
    }

    state.levelDown()
    state.indentLine()
    state.chars.push(")")
}

function forwardError(err: StringifyError, at: string): StringifyError {
    const split = err.message.split("inside")
    const msg = split.shift()!.trim()
    const higherAt = split.join("inside").trim()

    const message = `${msg} inside ${at} -> ${higherAt}`

    return new StringifyError(message)
}
