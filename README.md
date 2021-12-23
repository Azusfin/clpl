# CLPL

Chamaelyn Key-Value Pair Language

> ℹ️ May be used as a storage for storing information, data, or even lists.

## About

CLPL is a key-value pair based language for data.

Example:
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

## Format

Specification of the language format

[FORMAT.md](https://github.com/Azusfin/clpl/blob/main/FORMAT.md)

## Implementation

Specification of the Javascript/Typescript parser implementation

[SPEC.md](https://github.com/Azusfin/clpl/blob/main/SPEC.md)
