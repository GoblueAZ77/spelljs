spelljs
=======

*"There can be no worse reason for using the name 'c' than because a and b were
already taken." (Clean Code: A Handbook of Agile Software Craftsmanship)*

This small project does an important thing - it checks that the variables in
your code are meaningful, easy to read, and correct. It is, of course, an
ambitious task, but with a few of assumptions this can be done.

So, the assumptions:

* the complex names are hard to read and maintain;
* the short names do not explain the purpose of the variable;
* unusual variable formatting complicates understanding;
* the correct words are always easier to read than words with mistypes.

And some derived definitions:

* Complex name: a name that contain more than 4 words and 32 characters. These
numbers are arbitrary so you can change them as you wish. Just do not use some
big numbers (like 255) and you will be fine.
* Short name: one-letter name. See the quotation at the beginning.
* Usual variable formatting: "camelCase" or "CamelCase" or "CONSTANT_STYLE".
Not "this_one", "orFrankenstein_Style".
* Correct words: ones that matches the dictionary. Since almost 100% of the code
is made of English letters, the most common vocabulary is the English one.

So what this library does is it checks that identifiers are not complex, too
small, formatted correctly, and spelled correctly. To do this it first scans the
given JavaScript code and identifies the variables and then checks every found
variable agains the rules and dictionary.

So:

    console.log(require('spelljs')('var i = 1;'));
    [ { position: 4,
        line: 1,
        column: 5,
        message: 'The name \'i\' is too small.' } ]

Technicalities
--------------

The project consists of the four main parts:

* JavaScript scanner - small (about 400 lines) and simple lexical scanner
* Repository of rules - configurable repository of rules
* Dictionary rule - this one is here just because it is big enough
* Library facade - you probably will use this almost all the time you work with
the library

A few tests are in the file scan.tests.js.

Other Notes
-----------

There should be most interesting stuff, but currently there is not too much.

BTW, I suspect that the quotation from the beginning belongs originally to
someone else. If you know exactly to whom, just send me a note. Thanks.