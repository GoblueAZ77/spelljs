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

    var rules = {
            longName : function (name, parser, options) {
                return 33 > name.length ? null :
                        format('The name \'%s\' is too long.', name);
            },
            shortName : function (name, parsed, options) {
                if (false === options.enabled || (options &&
                        options.exceptions &&
                        -1 !== options.exceptions.indexOf(name))) {
                    return null;
                }

                return 1 < name.length ? null :
                        format('The name \'%s\' is too short.', name);
            },
            dictionary : function (name, parsed, options) {
                var words, dictionary;

                dictionary = (function (lists) {
                        var list;

                        list = [];
                        Object.keys(lists).forEach(function (key) {
                            Array.prototype.push.apply(list, lists[key]);
                        });

                        return function (word) {
                            return -1 !== list.indexOf(word);
                        };
                    }(options.dictionary));

                function check(word) {
                    return dictionary(word) || (options.extras &&
                            -1 !== options.extras.indexOf(word));
                }

                if (null === parsed) {
                    return null;
                }

                // parsed as "is Na N" so it is better to ignore it
                if ('isNaN' === name) {
                    return null;
                }

                if (1 < parsed.length) {
                    words = parsed.map(function (word) {
                        return 1 === word.length || check(word) ? null :
                                '\'' + word + '\'';
                    }).filter(function (word) {
                        return null !== word;
                    });

                    if (0 < words.length) {
                        return format(1 === words.length ?
                                'The word %s in %s is unknown or misspelled.' :
                                'The words %s in %s are unknown or misspelled.',
                            words.join(', '), name);
                    }
                } else if (1 < parsed[0].length && !check(parsed[0])) {
                    return format('The name \'%s\' is unknown or' +
                        ' misspelled.', parsed[0]);
                }

                return null;
            }
        };

    function parse(name) {
        var parts, first, second, re;

        parts = [];

        first = name.match(/^_?([a-z]+)([A-Z].*)?$/);

        if (null === first) {
            return null;
        }

        parts.push(first[1]);

        if (2 < first.length) {
            re = /[A-Z][a-z]+/g;
            while (null !== (second = re.exec(first[2]))) {
                parts.push(second[0].toLowerCase());
            }
        }

        return parts;
    }

    function check(tokens, options) {
        options = options || { };
        options.rules = options.rules || { };

        var messages = [];

        tokens.filter(function (token) {
            return token.id;
        }).forEach(function (token) {
            var parsed = parse(token.id);
            Object.keys(rules).forEach(function (key) {
                var message = rules[key](token.id, parsed,
                        options.rules[key] || { });
                if (null !== message) {
                    messages.push({
                        position : token.position,
                        line : token.line,
                        column : token.column,
                        message : message
                    });
                }
            });
        });

        return messages;
    }

    (function () {
        /*global module, window */
        if ('undefined' !== typeof module) {
            module.exports = check;
        } else if ('undefined' !== typeof window) {
            (window.spelljs || (window.spelljs = {})).check = check;
        }
    }());
}());