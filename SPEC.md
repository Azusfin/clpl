**Specifications of Javascript/Typescript CLPL Parser**

## Table Of Contents

* [Constants](#constants)
* [Methods](#methods)
* [Types](#types)

## Constants

These are the constants available:
* [version](#version)

### Version

The current used CLPL parser version

```js
version // ex. '0.1.0'
```

## Methods

These are the methods available:
* [Parse](#parse)
* [From](#from)
* [FromSync](#fromsync)
* [Transform](#transform)
* [Gen](#gen)
* [Stringify](#stringify)

### Parse

Parse the CLPL data into [Pairs](#pairs)

* Arguments
1. clplData: string - The CLPL data to parse from

* Return
[Pairs](#pairs)

* Usage
```js
parse(clplData)
```

* Example
```js
const pairs = parse("name = 'Bob'")
```

### From

Read from file and parse it as CLPL data into [Pairs](#pairs)

* Arguments
1. path: PathOrFileDescriptor - The file path or file descriptor
2. callback?: (err: Error | null, pairs?: [Pairs](#pairs)) -> void - Callback called on finish

* Usage
```js
from(path, callback?)
```

* Overloads
    * from(path: PathOrFileDescriptor) -> Promise<[Pairs](#pairs)>
    * from(path: PathOrFileDescriptor, callback: (err: Error | null, pairs?: [Pairs](#pairs)) -> void) -> void

* Example
```js
const pairs = await from("config.clpl")
```

### FromSync

Read from file synchronously and parse it as CLPL data into [Pairs](#pairs)

* Arguments
1. path: PathOrFileDescriptor - The file path or file descriptor

* Usage
```js
fromSync(path)
```

* Example
```js
const pairs = fromSync("config.clpl")
```

### Transform

Transform [Pairs](#pairs) into an Object or Map

* Arguments
1. pairs: [Pairs](#pairs) - The pairs to transform from
2. object?: boolean - Whether to transform to object instead of a map
3. transformer?: (pair: [Pair](#pair)) -> unknown? - Custom transformer function to transform pair into value

* Return
Map<string, unknown> | Record<string, unknown>

* Usage
```js
transform(pairs, object?, transformer?)
```

* Overloads
    * transform(pairs: [Pairs](#pairs), object: false, transformer?: (pair: [Pair](#pair)) -> unknown?) -> Map<string, unknown>
    * transform(pairs: [Pairs](#pairs), object: true, transformer?: (pair: [Pair](#pair)) -> unknown?) -> Record<string, unknown>

* Example
```js
const map = transform(pairs, false)
```

### Gen

Generate [Pairs](#pairs) from an object

* Arguments
1. obj: Map<string, unknown> | Record<string, unknown> - The object for generating to pairs from
2. generator?: (value: unknown) -> [Pair](#pair) - Custom generator function for generating pair from value
3. stack?: Set<Map<string, unknown> | Record<string, unknown> | unknown[]> - Set of references to prevent circular references

* Return
[Pairs](#pairs)

* Usage
```js
gen(obj, generator?, stack?)
```

* Example
```js
const pairs = gen({ name: "Bob" })
```

### Stringify

Stringify [Pairs](#pairs) into clplData

* Arguments
1. pairs: [Pairs](#pairs) - The pairs to stringify from
2. indent?: number - The number of indentation of the clplData, 0 for no indentation, max 6

* Return
string

* Usage
```js
stringify(pairs, indent?)
```

* Example
```js
const clplData = stringify(pairs, 2)
```

## Types

These are the types reserved in the parser:
* [Pairs](#pairs)
* [Pair](#pair)
* [Annotations](#annotations)
* [Annotation](#annotation)
* [Block](#block)
* [Annotation Block](#annotation-block)

### Pairs
Representing a group of [Pair](#pair)'s

Map<string, [Pair](#pair)>

### Pair
Representing a value from key-value pair

{
    annotations: [Annotations](#annotations),
    block: [Block](#block)
}

### Annotations
Representing a group of [Annotation](#annotation)'s

Map<string, [Annotation](#annotation)>

### Annotation
Representing an annotation of a value from key-value pair

{
    block: [Block](#block)
}

### Block
A super type representing type of a value

Type of blocks:
* [None Block](#none-block)
* [Boolean Block](#boolean-block)
* [Number Block](#number-block)
* [Text Block](#text-block)
* [List Block](#list-block)
* [Pairs Block](#pairs-block)
* [BigInt Block](#bigint-block)

#### None Block
A block representing none type

{
    type: 0
}

#### Boolean Block
A block representing a boolean (yes or no) type

{
    type: 1,
    value: boolean
}

#### Number Block
A block representing a number type

{
    type: 2,
    value: number
}

#### Text Block
A block representing a text type

{
    type: 3,
    value: string
}

#### List Block
A block representing a list type

{
    type: 4,
    value: [Pair](#pair)[]
}

#### Pairs Block
A block representing a pairs type

{
    type: 5,
    value: [Pairs](#pairs)
}

#### BigInt Block
A block representing a bigint type

{
    type: 6,
    value: bigint
}

### Annotation Block
A super type representing type of an annotation value

Type of annotation blocks:
* [None Block](#none-block)
* [Boolean Block](#boolean-block)
* [Number Block](#number-block)
* [Text Block](#text-block)
* [AnnotationList Block](#annotationlist-block)
* [Annotations Block](#annotations-block)
* [BigInt Block](#bigint-block)

#### AnnotationList Block
A block representing a list type for annotations

{
    type: 4,
    value: [Annotation](#annotation)[]
}

#### Annotations Block
A block representing a pairs type for annotations

{
    type: 5,
    value: [Annotations](#annotations)
}
