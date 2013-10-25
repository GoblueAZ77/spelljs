(function () {
    'use strict';

    var scan = require('./scan.js'),
        path = require('path'),
        fs = require('fs'),
        util = require('util');

    var dictionary = (function () {
            var file, list, extension = [];

            file = path.resolve(__dirname, '../dictionary/brit-a-z.txt');
            list = fs.readFileSync(file, 'utf8').trim().split('\r\n')
                .filter(function (item) {
                    return '' !== item && -1 === item.indexOf('\'');
                });

            return {
                extension : function (words) {
                    extension = words.slice(0);
                },
                check : function (word) {
                    return -1 !== list.indexOf(word) ||
                        -1 !== extension.indexOf(word);
                }
            };
        }());

    var rules = {
            longName : function (name, parser, options) {
                return 33 > name.length ? null :
                        util.format('The name \'%s\' is too long.', name);
            },
            shortName : function (name, parsed, options) {
                if (false === options.enabled || (options &&
                        options.exceptions &&
                        -1 !== options.exceptions.indexOf(name))) {
                    return null;
                }

                return 1 < name.length ? null :
                        util.format('The name \'%s\' is too short.', name);
            },
            dictionary : function (name, parsed, options) {
                var words;

                function check(word) {
                    return dictionary.check(word) || (options.extras &&
                            -1 !== options.extras.indexOf(word));
                }

                if (null === parsed) {
                    return null;
                }

                if (options.ignore && -1 !== options.ignore.indexOf(name)) {
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
                        return util.format(1 === words.length ?
                                'The word %s in %s is unknown or misspelled.' :
                                'The words %s in %s are unknown or misspelled.',
                            words.join(', '), name);
                    }
                } else if (1 < parsed[0].length && !check(parsed[0])) {
                    return util.format('The name \'%s\' is unknown or' +
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

    function main(code, options) {
        options = options || { };
        options.rules = options.rules || { };

        var messages = [];

        scan(code).filter(function (token) {
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

    module.exports = main;
}());