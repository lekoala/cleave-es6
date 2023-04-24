# Cleave ES6

ES6 port of https://github.com/nosir/cleave.js

Same features, except no phone or credit card support
Many PR have been reviewed and added

## What about react and angular ?

I don't see the point of supporting specific frameworks when you can have a custom element that works really well :-)

The custom element provides :

- a quick `type` attribute to set the input type
- a full `data-config` attribute that can store json configuration
- you are free to use whatever html you want to style/name your input element

## Documentation

Please refer to original docs for now https://github.com/nosir/cleave.js/tree/master/doc
or check the `demo.html` for sample usage

## Included PR

Add new option 'numeralDecimalPadding'
https://github.com/nosir/cleave.js/pull/707 (on blur only)

Fix duplicate numbers are entered when input number with microsoft pinyin
https://github.com/nosir/cleave.js/pull/663

feature: strict positive number
https://github.com/nosir/cleave.js/pull/660

Add support for hexademical only characters
https://github.com/nosir/cleave.js/pull/643

TODO: Add support for datetime fields (date and time in same field)
https://github.com/nosir/cleave.js/pull/637/files#diff-7d65c334f0c703a676992193c90a1d9a872fb6b8f73c2e624fc72c9eefc54d9e

Fix Ctrl+X behavior in read-only inputs
https://github.com/nosir/cleave.js/pull/633

Add first character uppercase option (renamed to ucfirst)
https://github.com/nosir/cleave.js/pull/623

Numeral decimal mark
https://github.com/nosir/cleave.js/pull/619/files

Patch prefix containing decimal (numeralDecimalMark)
https://github.com/nosir/cleave.js/pull/619

Fix backspace bug when next delimiter partially match previous
https://github.com/nosir/cleave.js/pull/579

## But I want credit card and phone support!

Well, I think there are better libs out there

- cardjs: https://cardjs.co.uk/
- intl tel: https://intl-tel-input.com/
