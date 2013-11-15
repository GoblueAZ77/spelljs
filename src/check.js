(function () {
    'use strict';

    function format(text) {
        var index, parameters;

        index = -1;
        parameters = Array.prototype.slice.call(arguments, 1);
        return text.replace(/%s/g, function () {
            index += 1;
            return parameters[index];
        });
    }

    function shortName(options) {
        var exceptions = options.exceptions || [];
        return function (id) {
            return 1 < id.length || -1 !== exceptions.indexOf(id) ? null :
                    format('The name \'%s\' is too short.', id);
        };
    }

    function longName(options) {
        return function (id) {
            return 33 > id.length ? null :
                    format('The name \'%s\' is too long.', id);
        };
    }

    function spellCheck(options) {
        var dictionary;

        /**
         * Detects words in the identifier name.
         *
         * Converts THISIsStyle, ThisIsStyle, thisIsStyle, and thisISStyle to
         * [ "this", "is", "style" ].
         */
        function parseWords(id) {
            var words, parts, isUpper, isDigit;

            isUpper = (function () {
                var min = 'A'.charCodeAt(0) - 1,
                    max = 'Z'.charCodeAt(0) - 1;

                return function (ch) {
                    var code = ch.charCodeAt(0);
                    return min < code && code < max;
                };
            }());

            isDigit = (function () {
                var min = '0'.charCodeAt(0) - 1,
                    max = '9'.charCodeAt(0) - 1;

                return function (ch) {
                    var code = ch.charCodeAt(0);
                    return min < code && code < max;
                };
            }());

            words = [];
            id.split('_').forEach(function (part) {
                var word;

                if ('' === part) {
                    return;
                }

                word = '';
                part.split('').forEach(function (ch, idx) {
                    var previousIsUpper, previousIsLower, previousIsDigit,
                        nextIsBig, first, last;

                    if (isDigit(ch)) {
                        if ('' !== word) {
                            words.push(word.toLowerCase());
                            word = '';
                        }
                        return;
                    }

                    // ABC -> ABC
                    // aBC -> a, BC
                    // AbC -> Ab, C
                    // ABc -> A, Bc
                    // abC -> ab, C
                    // aBc -> a, Bc
                    // Abc -> Abc,
                    // abc -> abc
                    if (isUpper(ch)) {
                        first = 0 === idx;
                        previousIsUpper = !first && isUpper(part[idx - 1]);
                        previousIsDigit = !first && isDigit(part[idx - 1]);
                        previousIsLower = !first && !previousIsUpper &&
                            !previousIsDigit;
                        last = idx === part.length - 1;
                        nextIsBig = !last && isUpper(part[idx + 1]);

                        if (previousIsLower || !(nextIsBig || last)) {
                            if ('' !== word) {
                                words.push(word.toLowerCase());
                            }
                            word = ch;
                        } else {
                            word += ch;
                        }
                    } else {
                        word += ch;
                    }
                });

                if ('' !== word) {
                    words.push(word.toLowerCase());
                }
            });

            return words;
        }

        dictionary = (function (lists) {
            var list;

            list = [];
            Object.keys(lists).forEach(function (key) {
                Array.prototype.push.apply(list, lists[key]);
            });

            return function (word) {
                return -1 !== list.indexOf(word);
            };
        }(options.dictionary || [ ]));

        return function (id) {
            var words, unknownWords;

            // parsed as "is Na N" so it is better to ignore it
            if ('isNaN' === id) {
                return null;
            }

            words = parseWords(id);

            if (1 < words.length) {
                unknownWords = words.map(function (word) {
                    return 1 === word.length || dictionary(word) ? null :
                            '\'' + word + '\'';
                }).filter(function (word) {
                    return null !== word;
                });

                if (0 < unknownWords.length) {
                    return format(1 === unknownWords.length ?
                            'The word %s in %s is unknown or misspelled.' :
                            'The words %s in %s are unknown or misspelled.',
                        unknownWords.join(', '), id);
                }
            } else if (1 < words[0].length && !dictionary(words[0])) {
                return format('The name \'%s\' is unknown or' +
                    ' misspelled.', words[0]);
            }

            return null;
        };
    }

    function rules(options) {
        options = options || [];

        var list = {
                longName : longName,
                shortName : shortName,
                spellCheck : spellCheck
            };

        return Object.keys(list).reduce(function (result, key) {
            if (!options[key] || false !== options[key].enabled) {
                result[key] = list[key](options[key] || { });
            }
            return result;
        }, { });
    }

    function run(rules, tokens) {
        var messages = [];

        tokens.filter(function (token) {
            return token.id;
        }).forEach(function (token) {
            Object.keys(rules).forEach(function (key) {
                var result = rules[key](token.id);

                if ('string' === typeof result) {
                    result = [ result ];
                } else if (null === result || undefined === result) {
                    result = [ ];
                }

                if (result instanceof Array) {
                    Array.prototype.push.apply(messages,
                        result.map(function (message) {
                            return {
                                position : token.position,
                                line : token.line,
                                column : token.column,
                                rule : key,
                                message : message
                            };
                        }));
                } else {
                    messages.push({
                        position : token.position,
                        line : token.line,
                        column : token.column,
                        rule : key,
                        message : result.toString()
                    });
                }
            });
        });

        return messages;
    }

    (function () {
        /*global module, window */
        var methods = { rules : rules, run : run };

        if ('undefined' !== typeof module) {
            module.exports = methods;
        } else if ('undefined' !== typeof window) {
            (window.spelljs || (window.spelljs = {})).check = methods;
        }
    }());
}());