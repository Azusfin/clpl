export type Pairs = Map<string, Pair>

export interface Pair {
    annotations: Annotations
    block: Block
}

export type Annotations = Map<string, Annotation>

export interface Annotation {
    block: AnnotationBlock
}

export type Block =
    | NoneBlock
    | BooleanBlock
    | NumberBlock
    | TextBlock
    | ListBlock
    | PairsBlock
    | BigIntBlock

export type AnnotationBlock =
    | NoneBlock
    | BooleanBlock
    | NumberBlock
    | TextBlock
    | ListAnnotationBlock
    | AnnotationsBlock
    | BigIntBlock

export interface NoneBlock {
    type: 0
}

export interface BooleanBlock {
    type: 1
    value: boolean
}

export interface NumberBlock {
    type: 2
    value: number
}

export interface TextBlock {
    type: 3
    value: string
}

export interface ListBlock {
    type: 4
    value: Pair[]
}

export interface ListAnnotationBlock {
    type: 4
    value: Annotation[]
}

export interface PairsBlock {
    type: 5
    value: Pairs
}

export interface AnnotationsBlock {
    type: 5
    value: Annotations
}

export interface BigIntBlock {
    type: 6
    value: bigint
}
