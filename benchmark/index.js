const clpl = require('../')
const benny = require('benny')
const { readFileSync } = require('fs')

const clplData = readFileSync('examples/value-only.clpl', 'utf-8')

let pairs
let map
let obj

benny.suite(
    "CLPL",
    benny.add("Parse", () => {
        pairs = clpl.parse(clplData)
    }),
    benny.add("Transform Map", () => {
        map = clpl.transform(pairs)
    }),
    benny.add("Transform Obj", () => {
        obj = clpl.transform(pairs, true)
    }),
    benny.add("Generate from Map", () => {
        clpl.gen(map)
    }),
    benny.add("Generate from Obj", () => {
        clpl.gen(obj)
    }),
    benny.add("Stringify", () => {
        clpl.stringify(pairs, 4)
    }),
    benny.cycle((_, summary) => {
        const progress = (
            (summary.results.filter((result) => result.samples !== 0).length /
                summary.results.length) *
                100
        ).toFixed(2)

        const progressInfo = `Progress: ${progress}%`

        const output = summary.results
            .map(item => {
                const ops = item.ops.toLocaleString("en-us")
                const margin = item.margin.toFixed(2)

                return item.samples
                    ? `\n  ${item.name}:\n`
                        + `      ${ops} ops/s, ±${margin}% (${item.samples} samples)`
                    : null
            })
            .filter(item => item !== null)
            .join("\n")

        return `${progressInfo}\n${output}`
    })
)
