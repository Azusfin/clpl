# CLPL

\*.clp \*.clpl

**CLPL** \[_`Si-El-Pi-El`_\]

**Chamaelyn Key-Value Pair Language** \[_`Sha-Ma-E-Lin Qi-Va-Luy Pe-Ir Le-Ngu-Ej`_\]

> ℹ️ May be used as a storage for storing information, data, or even lists.

## Table Of Contents

- [Introduction](#introduction)
- [Types](#types)
- [Annotation](#annotation)
- [Comments](#comments)
- [One Line](#one-line)
- [Special Characters](#special-characters)
- [Rules](#rules)

## Introduction

CLPL is a key-value pair based language for data.

> ⚠️ Keys are case-sensitive.

```clpl
name >
    first-name = 'Andrew'
    family-name = 'Pablo'
<

@country=1
@area=415
phone = 732_3156

job = [
    'Teacher'
    'Driver'
]

address = (
    country = 'USA'
    state = 'California'
    city = 'San Fransisco'
)

email + (
    id = 'andrew1email135'
    domain = 'ymail.com'
)

email + (
    id = 'andrew2email531'
    domain = 'gmail.com'
)
```

## Types

Each value has each own type which will explained below:

- [None](#none)
- [Boolean](#boolean)
- [Number](#number)
- [Text](#text)
- [List](#list)
- [Pairs](#pairs)
- [BigInt](#bigint)

#### None

`None` type refer to something that doesn't exist.

This can refer to thing that may exist on other pair,
but doesn't exist on current pair.

`None` is written as `none`

Example:
```clpl
family + (
    name = 'Bob'

    # Bob has a phone number
    phone = '+1 (213) 653-5325'
)

family + (
    name = 'Poppy'

    # Poppy doesn't have a phone number
    phone = none
)
```

#### Boolean

`Boolean` type refer to a thing that are either true or false

`Boolean` can be written either as `yes` or `no`

Example:
```clpl
family + (
    name = 'Bob'

    # Bob has a phone number
    has-phone = yes
)

family + (
    name = 'Poppy'

    # Poppy doesn't have a phone number
    has-phone = no
)
```

#### Number

`Number` type refer to some numbers in double-precision
with decimals support

Example:
```clpl
cash = 1225
```

Number can be separated with `_` as following:
```clpl
cash = 1_225
```

Number may contain decimals
```clpl
cash = 1_225.20
```

#### Text

`Text` type refer to a text value

Example:
```clpl
description = 'A text'
```

Split text to another line:
```clpl
description = 'A text
split to another line'
```

Use `\` at the end of previous line to prevent trailing spaces:
```clpl
description = 'A text\
    split to\
    another line'
```

`Text` type has two sub-types which will be explained below:

- [Single Quote](#single-quote)
- [Double Quote](#double-quote)

##### Single Quote

A single quote text will escape all the escape characters,
except for escaping `'` itself and trailing spaces

Example:
```clpl
description = 'This won\'t made a\nnew line\nat the text'
```

Will be parsed to
```
This won't made a\\nnew line\\nat the text
```

Instead of
```
This won't made a
new line
at the text
```

##### Double Quote

A double quote text will parse the escape characters

Supported escape characters:
| Character | Description                                              |
| --------- | -------------------------------------------------------- |
| \\'       | Single Quote                                             |
| \\"       | Double Quote                                             |
| \\\\      | Backslash                                                |
| \\n       | New Line                                                 |
| \\r       | Carriage Return                                          |
| \\t       | Horizontal Tab                                           |
| \\b       | Backspace                                                |
| \\f       | Form Feed                                                |
| \\v       | Vertical Tab                                             |
| \\uFFFF   | Character represent by hexadecimal from "0000" to "FFFF" |

Example:
```clpl
description = "This will made a\nnew line\nat the text"
```
```clpl
description = "This will made a\n
new line\n
at the text"
```
```clpl
description = "This will made a\n\
    new line\n\
    at the text"
```

Will be parsed to:
```
This will made a
new line
at the text
```

#### List

`List` type refer to a list of values

`List` type may refer to a pair which contain more than one values

Example:
```clpl
text = [
    'First text'
    'Second text'
]
```

May also add another value without doing it from the pair
```clpl
text + 'Third text'
text + 'Fourth text'
text + 'Fifth text'
```

#### Pairs

`Pairs` type are referring to a group of key-value pair

`Pairs` type are the top-level type in CLPL

Example:
```clpl
profile = (
    name = 'Joe'
    have-job = yes
)
```

May also modify the pairs without doing it from the pair
```clpl
# {
#   name: 'Joe',
#   'have-job': true,
#   job: 'Engineer',
#   email: 'joemama542@gmail.com'
# }

profile >
    job = 'Engineer'
    email = 'joemama542@gmail.com'
<
```

#### BigInt

`BigInt` type refer to some numbers in int64

`BigInt` may be written as `<number>n`

Example:
```clpl
id = 918378257521442816n
```

With separator:
```clpl
id = 918378257521_442_816n
```

## Annotation

`Annotation` may be used as a notes separated from the value

`Annotation` may still be parsed

`Annotation` is written as `@<name>`

Assigning value to `Annotation` may done by doing `@<name>=<value>`

`Annotation` without value is the same as assigning `Annotation` with [None](#none)

Example:
```clpl
@for='Joe'
@domain='ymail.com'
email + 'joemail'

@for='Bob'
@domain='gmail.com'
email + 'bobmail'
```

`@doc='description'` may be used to document value

`@lint='language'` may be used for code text
    to help linters analyze the code (if the linter support)

## Comments

`Comments` may be used as a note in the document

`Comments` won't be parsed

`Comments` are written as `# some comment`

`Comments` are written per-line

Example:
```clpl
# Hello
# Im a comment
# And i won't be parsed

name = 'Andy'
has-email = yes

# Im also a comment
# And i also won't be parsed
```

## One Line

This pairs:
```clpl
name = 'Andy'
has-email = yes

# Andy email
email = 'andymail@gmail.com'
```

May be written in one-line as:
```clpl
name = 'Andy' has-email = yes email = 'andymail@gmail.com'
```

Don't write comments when writing in one-line
```clpl
# email won't be parsed
name = 'Andy' has-email = yes # Andy email email = 'andymail@gmail.com'
```

One-line document isn't easily readable so it's not recommended

## Special Characters

These are special characters in CLPL

| Special Character | Description          |
| ----------------- | -------------------- |
| (space)           | Reserved             |
| (newline)         | Not parsed           |
| #                 | Comment              |
| @                 | Annotation           |
| =                 | Assign Value         |
| '                 | Single Quote Text    |
| "                 | Double Quote Text    |
| [                 | List Opening         |
| ]                 | List Closing         |
| +                 | Add List Value       |
| (                 | Pairs Opening        |
| )                 | Pairs Closing        |
| >                 | Modify-Pairs Opening |
| <                 | Modify-Pairs Closing |
| _                 | Number Separator     |

Keys can't have a newline

Keys may still use special characters except comments, annotations, or spaces

Keys may use '\<key>' if it contains comments, annotations or spaces

Example:
```clpl
'@name #short' = 'Andrew'
'@name #long' = 'Andrew Poppy Lawrence'
name-(without-family) = 'Andrew Poppy'
```

## Rules

Here are some additional simple rules of CLPL:
- [Value on the same line](#value-on-the-same-line)
- [Pairs are constant](#pairs-are-constant)
- [Spcae sensitive](#space-sensitive)
- [Auto assign](#auto-assign)
- [Value annotation](#value-annotation)
- [Modify annotation](#modify-annotation)
- [No recursive annotation](#no-recursive-annotation)

#### Value on the same line

> ✅ Valid
```clpl
name = 'Bob'
```

> ❌ Invalid
```clpl
name =
    'Bob'
```

> ❌ Invalid
```clpl
name
    = 'Bob'
```

> ✅ Valid
```clpl
names = [
    'Bob'
    'Joe'
]
```
```clpl
profile = (
    name = 'Bob'
    has-phone = yes
    phone = '+1 (421) 555-3511'
)
```

> ❌ Invalid
```clpl
names =
[
    'Bob'
    'Joe'
]
```
```clpl
profile = 
(
    name = 'Bob'
    has-phone = yes
    phone = '+1 (421) 555-3511'
)
```

#### Pairs are constant

> Pair's cannot be reassigned once assigned
```clpl
name = 'Bob'

# Error
name = 'Joe'

email = (
    id = 'joemamamail'
    domain = 'gmail.com'
)

email >
    inactive = yes

    # Error
    domain = 'ymail.com'
<
```

#### Space sensitive

> CLPL are space-senstive

> ✅ Valid
```clpl
name = 'Bob'
```

> ❌ Invalid
```clpl
name='Bob'
```

> ✅ Weirdly Valid
```clpl
a=b = 'c'
```

> ❌ Invalid
```clpl
a=b='c'
```

#### Auto assign

> Adding list value will assign the pair as list if it haven't
```clpl
# Unnecessary assign
list = []

list + 'value'
```
```clpl
# Doesn't need assign because it automatically assigned

list + 'value'
```

> Same with modifying pairs
```clpl
# Unnecessary assign
pairs = ()

pairs >
    key = 'value'
<
```
```clpl
# Doesn't need assign because it automatically assigned

pairs >
    key = 'value'
<
```

#### Value annotation

> All annotations are applied to the value (which are the pair)
```clpl
@doc='Document the value'
key = 'value'
```

> It's obvious it will also applied to the value when adding value to a list
```clpl
@doc='Document the value'
list + 'value'
```

> So it'll need to manually assign the list if want to apply anotation to the list
```clpl
@doc='Document the list'
list = []

@doc='Document the value'
list + 'value'
```

> Applying anotation to modify-pairs will still apply to the pairs
```clpl
@doc='Document the pairs'
pairs >
    @doc('Document the value')
    key = 'value'
<
```

#### Modify annotation

> If applying annotation to modfy-pairs then it will replace the previous applied annotation
```clpl
# Will get 'Note 1' as the 'note1' annotation

@note1='Note 1'
pairs >
    key = 'value'
<
```
```clpl
# Will get 'Note 1' as the 'note1' annotation
# Will get 'Note 2' as the 'note2' annotation

@note1='Note 1'
pairs = ()

@note2='Note 2'
pairs >
    key = 'value'
<
```
```clpl
# Will get 'Note 1' as the 'note1' annotation
# Will get 'Note 2' as the 'note2' annotation

@note1='Note 1'
@note2='Note 2'
pairs = ()

pairs >
    key = 'value'
<
```
```clpl
# Will get 'Note 1' as the 'note1' annotation
# Will get 'Modified Note 2' as the 'note2' annotation

@note1='Note 1'
@note2='Note 2'
pairs = ()

@note2='Modified Note 2'
pairs >
    key = 'value'
<
```

#### No Recursive Annotation

> You can't have recursive annotation
```clpl
@doc=(
    test = "I'll be fine"
)
key = 'value'
```
```clpl
@doc=(
    # Error here
    @doc='hmm'
    test = "I don't feel so good"
)
key = 'value'
```
