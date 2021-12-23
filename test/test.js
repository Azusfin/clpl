const { readFileSync } = require("fs")
const assert = require("assert/strict")
const clpl = require("../")

describe("CLPL", function() {
    const ciExample = readFileSync("examples/ci-example.clpl", "utf-8")
    let ciExamplePairs
    let ciExampleObj

    const family = readFileSync("examples/family.clpl", "utf-8")
    let familyPairs
    let familyObj

    const language = readFileSync("examples/language.clpl", "utf-8")
    let languagePairs
    let languageObj

    const oneLine = readFileSync("examples/one-line.clpl", "utf-8")
    let oneLinePairs
    let oneLineObj

    const profile = readFileSync("examples/profile.clpl", "utf-8")
    let profilePairs
    let profileObj

    const valueOnly = readFileSync("examples/value-only.clpl", "utf-8")
    let valueOnlyPairs
    let valueOnlyObj

    describe("Parse", function() {
        it("value-only.clpl", function() {
            valueOnlyPairs = clpl.parse(valueOnly)
        })

        it("language.clpl", function() {
            languagePairs = clpl.parse(language)
        })

        it("one-line.clpl", function() {
            oneLinePairs = clpl.parse(oneLine)
        })

        it("profile.clpl", function() {
            profilePairs = clpl.parse(profile)
        })

        it("family.clpl", function() {
            familyPairs = clpl.parse(family)
        })

        it("ci-example.clpl", function() {
            ciExamplePairs = clpl.parse(ciExample)
        })
    })

    describe("From", function() {
        it("value-only.clpl", function() {
            return clpl.from("examples/value-only.clpl")
        })

        it("language.clpl", function() {
            return clpl.from("examples/language.clpl")
        })

        it("one-line.clpl", function() {
            return clpl.from("examples/one-line.clpl")
        })

        it("profile.clpl", function() {
            return clpl.from("examples/profile.clpl")
        })

        it("family.clpl", function() {
            return clpl.from("examples/family.clpl")
        })

        it("ci-example.clpl", function() {
            return clpl.from("examples/ci-example.clpl")
        })
    })

    describe("From Sync", function() {
        it("value-only.clpl", function() {
            clpl.fromSync("examples/value-only.clpl")
        })

        it("language.clpl", function() {
            clpl.fromSync("examples/language.clpl")
        })

        it("one-line.clpl", function() {
            clpl.fromSync("examples/one-line.clpl")
        })

        it("profile.clpl", function() {
            clpl.fromSync("examples/profile.clpl")
        })

        it("family.clpl", function() {
            clpl.fromSync("examples/family.clpl")
        })

        it("ci-example.clpl", function() {
            clpl.fromSync("examples/ci-example.clpl")
        })
    })

    describe("Transform", function() {
        try {
            valueOnlyPairs = clpl.parse(valueOnly)
            languagePairs = clpl.parse(language)
            oneLinePairs = clpl.parse(oneLine)
            profilePairs = clpl.parse(profile)
            familyPairs = clpl.parse(family)
            ciExamplePairs = clpl.parse(ciExample)
        } catch {}

        if (valueOnlyPairs) {
            describe("value-only.clpl", function() {
                it("Map", function() {
                    valueOnlyObj = clpl.transform(valueOnlyPairs)
                    assert.equal(
                        typeof valueOnlyObj === "object" &&
                        valueOnlyObj !== null &&
                        valueOnlyObj instanceof Map, 
                        true
                    )
                })

                it("Obj", function() {
                    valueOnlyObj = clpl.transform(valueOnlyPairs, true)
                    assert.equal(
                        typeof valueOnlyObj === "object" &&
                        valueOnlyObj !== null &&
                        !(valueOnlyObj instanceof Map),
                        true
                    )
                })
            })
        }

        if (languagePairs) {
            describe("language.clpl", function() {
                it("Map", function() {
                    languageObj = clpl.transform(languagePairs)
                    assert.equal(
                        typeof languageObj === "object" &&
                        languageObj !== null &&
                        languageObj instanceof Map, 
                        true
                    )
                })

                it("Obj", function() {
                    languageObj = clpl.transform(languagePairs, true)
                    assert.equal(
                        typeof languageObj === "object" &&
                        languageObj !== null &&
                        !(languageObj instanceof Map),
                        true
                    )
                })
            })
        }

        if (oneLinePairs) {
            describe("one-line.clpl", function() {
                it("Map", function() {
                    oneLineObj = clpl.transform(oneLinePairs)
                    assert.equal(
                        typeof oneLineObj === "object" &&
                        oneLineObj !== null &&
                        oneLineObj instanceof Map, 
                        true
                    )
                })

                it("Obj", function() {
                    oneLineObj = clpl.transform(oneLinePairs, true)
                    assert.equal(
                        typeof oneLineObj === "object" &&
                        oneLineObj !== null &&
                        !(oneLineObj instanceof Map),
                        true
                    )
                })
            })
        }

        if (profilePairs) {
            describe("profile.clpl", function() {
                it("Map", function() {
                    profileObj = clpl.transform(profilePairs)
                    assert.equal(
                        typeof profileObj === "object" &&
                        profileObj !== null &&
                        profileObj instanceof Map, 
                        true
                    )
                })

                it("Obj", function() {
                    profileObj = clpl.transform(profilePairs, true)
                    assert.equal(
                        typeof profileObj === "object" &&
                        profileObj !== null &&
                        !(profileObj instanceof Map),
                        true
                    )
                })
            })
        }

        if (familyPairs) {
            describe("family.clpl", function() {
                it("Map", function() {
                    familyObj = clpl.transform(familyPairs)
                    assert.equal(
                        typeof familyObj === "object" &&
                        familyObj !== null &&
                        familyObj instanceof Map, 
                        true
                    )
                })

                it("Obj", function() {
                    familyObj = clpl.transform(familyPairs, true)
                    assert.equal(
                        typeof familyObj === "object" &&
                        familyObj !== null &&
                        !(familyObj instanceof Map),
                        true
                    )
                })
            })
        }

        if (ciExamplePairs) {
            describe("ci-example.clpl", function() {
                it("Map", function() {
                    ciExampleObj = clpl.transform(ciExamplePairs)
                    assert.equal(
                        typeof ciExampleObj === "object" &&
                        ciExampleObj !== null &&
                        ciExampleObj instanceof Map, 
                        true
                    )
                })

                it("Obj", function() {
                    ciExampleObj = clpl.transform(ciExamplePairs, true)
                    assert.equal(
                        typeof ciExampleObj === "object" &&
                        ciExampleObj !== null &&
                        !(ciExampleObj instanceof Map),
                        true
                    )
                })
            })
        }
    })

    describe("Generate", function() {
        try {
            valueOnlyPairs = clpl.parse(valueOnly)
            languagePairs = clpl.parse(language)
            oneLinePairs = clpl.parse(oneLine)
            profilePairs = clpl.parse(profile)
            familyPairs = clpl.parse(family)
            ciExamplePairs = clpl.parse(ciExample)
        } catch {}

        if (valueOnlyPairs) {
            describe("value-only.clpl", function() {
                try {
                    valueOnlyObj = clpl.transform(valueOnlyPairs)
                } catch {}

                if (valueOnlyObj) {
                    it("Map", function() {
                        clpl.gen(valueOnlyObj)
                    })
                }

                try {
                    valueOnlyObj = clpl.transform(valueOnlyPairs, true)
                } catch {}

                if (valueOnlyObj) {
                    it("Obj", function() {
                        clpl.gen(valueOnlyObj)
                    })
                }
            })
        }

        if (languagePairs) {
            describe("language.clpl", function() {
                try {
                    languageObj = clpl.transform(languagePairs)
                } catch {}

                if (languageObj) {
                    it("Map", function() {
                        clpl.gen(languageObj)
                    })
                }

                try {
                    languageObj = clpl.transform(languagePairs, true)
                } catch {}

                if (languageObj) {
                    it("Obj", function() {
                        clpl.gen(languageObj)
                    })
                }
            })
        }

        if (oneLinePairs) {
            describe("one-line.clpl", function() {
                try {
                    oneLineObj = clpl.transform(oneLinePairs)
                } catch {}

                if (oneLineObj) {
                    it("Map", function() {
                        clpl.gen(oneLineObj)
                    })
                }

                try {
                    oneLineObj = clpl.transform(oneLinePairs, true)
                } catch {}

                if (oneLineObj) {
                    it("Obj", function() {
                        clpl.gen(oneLineObj)
                    })
                }
            })
        }

        if (profilePairs) {
            describe("profile.clpl", function() {
                try {
                    profileObj = clpl.transform(profilePairs)
                } catch {}

                if (profileObj) {
                    it("Map", function() {
                        clpl.gen(profileObj)
                    })
                }

                try {
                    profileObj = clpl.transform(profilePairs, true)
                } catch {}

                if (profileObj) {
                    it("Obj", function() {
                        clpl.gen(profileObj)
                    })
                }
            })
        }

        if (familyPairs) {
            describe("family.clpl", function() {
                try {
                    familyObj = clpl.transform(familyPairs)
                } catch {}

                if (familyObj) {
                    it("Map", function() {
                        clpl.gen(familyObj)
                    })
                }

                try {
                    familyObj = clpl.transform(familyPairs, true)
                } catch {}

                if (familyObj) {
                    it("Obj", function() {
                        clpl.gen(familyObj)
                    })
                }
            })
        }

        if (ciExamplePairs) {
            describe("ci-example.clpl", function() {
                try {
                    ciExampleObj = clpl.transform(ciExamplePairs)
                } catch {}

                if (ciExampleObj) {
                    it("Map", function() {
                        clpl.gen(ciExampleObj)
                    })
                }

                try {
                    ciExampleObj = clpl.transform(ciExamplePairs, true)
                } catch {}

                if (ciExampleObj) {
                    it("Obj", function() {
                        clpl.gen(ciExampleObj)
                    })
                }
            })
        }
    })

    describe("Stringify", function() {
        try {
            valueOnlyPairs = clpl.parse(valueOnly)
            languagePairs = clpl.parse(language)
            oneLinePairs = clpl.parse(oneLine)
            profilePairs = clpl.parse(profile)
            familyPairs = clpl.parse(family)
            ciExamplePairs = clpl.parse(ciExample)
        } catch {}

        if (valueOnlyPairs) it("value-only.clpl", function() {
            const data = clpl.stringify(valueOnlyPairs, 4)
            clpl.parse(data)
        })

        if (languagePairs) it("language.clpl", function() {
            const data = clpl.stringify(languagePairs, 4)
            clpl.parse(data)
        })

        if (oneLinePairs) it("one-line.clpl", function() {
            const data = clpl.stringify(oneLinePairs, 4)
            clpl.parse(data)
        })

        if (profilePairs) it("profile.clpl", function() {
            const data = clpl.stringify(profilePairs, 4)
            clpl.parse(data)
        })

        if (familyPairs) it("family.clpl", function() {
            const data = clpl.stringify(familyPairs, 4)
            clpl.parse(data)
        })

        if (ciExamplePairs) it("ci-example.clpl", function() {
            const data = clpl.stringify(ciExamplePairs, 4)
            clpl.parse(data)
        })
    })
})
