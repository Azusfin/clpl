import { readFile, readFileSync } from "fs"

type PathOrFileDescriptor = number | string | Buffer | URL

/**
 * The CLPL parser version
 */
export const version: string = JSON.parse(
    readFileSync(require.resolve("../package.json"), "utf-8")
).version

export * as Types from "./Types"
export * as Regexes from "./Regexes"
export * as Parser from "./Parser"
export * as Transformer from "./Transformer"
export * as Generator from "./Generator"
export * as Stringifier from "./Stringifier"

import * as Types from "./Types"
import { NEWLINE } from "./Regexes"
import { parseData } from "./Parser"
import { transformPairs, defaultTransformer } from "./Transformer"
import { ReferencesStack,genPairs, defaultGenerator } from "./Generator"
import { StringifyState, stringifyPairs } from "./Stringifier"

/**
 * Parse the CLPL data into Pairs
 * @param clplData The CLPL data to parse from
 */
export function parse(clplData: string): Types.Pairs {
    if (typeof clplData !== "string") throw new TypeError(`clplData must be a string`)
    const data = clplData.split(NEWLINE).map(line => line.split(" "))
    return parseData(data)
}

/**
 * Read from file and parse it as CLPL data
 * @param path @param path The file path or file descriptor
 */
export function from(path: PathOrFileDescriptor): Promise<Types.Pairs>

/**
 * Read from file and parse it as CLPL data
 * @param path The file path or file descriptor
 * @param callback Callback on finish
 */
export function from(
    path: PathOrFileDescriptor,
    callback: (err: Error | null, pairs?: Types.Pairs) => void
): void

/**
 * Read from file and parse it as CLPL data
 * @param path The file path or file descriptor
 * @param callback Callback on finish
 */
export function from(
    path: PathOrFileDescriptor,
    callback?: (err: Error | null, pairs?: Types.Pairs) => void
): Promise<Types.Pairs> | void {
    if (typeof callback !== "function") {
        return new Promise((resolve, reject) => {
            from(path, (err, pairs) => {
                if (err !== null) reject(err)
                else resolve(pairs!)
            })
        })
    }

    readFile(path, "utf-8", (err, data) => {
        if (err !== null) callback(err)
        else {
            try {
                callback(null, parse(data))
            } catch (err) {
                callback(err)
            }
        }
    })
}

/**
 * Read from file synchronously and parse it as CLPL data
 * @param path The file path or file descriptor
 */
export function fromSync(path: PathOrFileDescriptor): Types.Pairs {
    const data = readFileSync(path, "utf-8")
    return parse(data)
}

/**
 * Transform Pairs into an Object or Map
 * @param pairs The pairs to transform from
 * @param object Whether to transform to object instead of a map
 * @param transformer Custom transformer function to transform pair into value
 */
export function transform<O extends boolean = false>(
    pairs: Types.Pairs,
    object: O = false as O,
    transformer = defaultTransformer
): O extends true ? Record<string, unknown> : Map<string, unknown> {
    if (typeof pairs !== "object" || pairs === null || !(pairs instanceof Map)) throw new TypeError(`pairs must be a Map`)
    if (typeof object !== "boolean") throw new TypeError(`object arg must be a boolean`)
    if (typeof transformer !== "function") throw new TypeError(`transformer must be a function`)
    return transformPairs(pairs, transformer, object)
}

/**
 * Generate Pairs from an object
 * @param obj The object for generating to pairs from
 * @param generator Custom generator function for generating pair from value
 * @param stack Set of references to prevent circular references
 */
export function gen(
    obj: Map<string, unknown> | Record<string, unknown>,
    generator = defaultGenerator,
    stack: ReferencesStack = new Set()
): Types.Pairs {
    if (typeof obj !== "object" || obj === null) throw new TypeError(`obj must be an object`)
    if (typeof generator !== "function") throw new TypeError(`generator must be a function`)
    if (typeof stack !== "object" || stack === null || !(stack instanceof Set)) throw new TypeError(`stack must be a Set`)
    return genPairs(obj, generator, stack)
}

/**
 * Stringify the pairs into CLPL data
 * @param pairs The pairs to stringify from
 * @param indent The number of indentation of the clplData, 0 for no indentation, max 6
 */
export function stringify(
    pairs: Types.Pairs,
    indent = 0
): string {
    if (typeof pairs !== "object" || pairs === null || !(pairs instanceof Map)) throw new TypeError("pairs must be a Map")
    if (typeof indent !== "number" || isNaN(indent)) throw new TypeError("argument 'indent' must be a valid number")

    indent = Math.max(0, Math.min(6, indent))

    const state = new StringifyState(indent)
    stringifyPairs(pairs, state, true)

    state.chars.pop()
    return state.chars.join("")
}
