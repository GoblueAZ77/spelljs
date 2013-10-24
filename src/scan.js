/**
 * Scans source code and returns a stream of tokens.
 *
 * The scanner understands ECMA-262, edition 5.1 (June 2011).
 *
 * Token-specific properties: comment, id - identifier, lt - line terminator,
 * pt - punctuator, re - regexp, str - string, ws - whitespace, keyword.
 */
(function () {
    'use strict';

    var chr, punctuators, divPunctuators, keywords, State;

    /**
     * There are two approaches on checking the character:
     *
     * * By following the specification and quering Unicode Character Database
     *   (UCD). This approach requires additional dependency on eigher plain
     *   text data or some module that encapsulate it (The "unicode" module
     *   seems to be the good one). See the file characters.js for the details.
     * * By querying the engine with the `'var ...'` statements. This approach
     *   is extremely slow on the complete range of characters, but the complete
     *   range is almost never necessary.
     */
    chr = (function () {
        function chars(list) {
            var pattern = '[\\u' + list.replace(/(?:(-)| )/g, '$1\\u') + ']',
                regexp = new RegExp(pattern),
                fn = function (ch) { return regexp.test(ch); };
            fn.not = function (ch) { return !fn(ch); };
            return fn;
        }
        function cache(storage, key, create) {
            var result = storage[key];
            return undefined === result ? storage[key] = create() : result;
        }
        var idStartCache = { }, idContCache = { };
        return {
            ws : chars('0009 000B 000C 0020 00A0 FEFF'),
            lt : chars('000A 000D 2028 2029'),
            idStart : function (ch) {
                return cache(idStartCache, ch, function () {
                    try {
                        return 'a' === eval('var _q={},' + ch + '_=\'a\';' +
                            '_q[' + ch + '_]=7;(' + ch + '_)');
                    } catch (e) { }
                    return false;
                });
            },
            idCont : function (ch) {
                return cache(idContCache, ch, function () {
                    try {
                        var r = eval('var q={},_' + ch + '1=\'a\';' +
                            'q[_' + ch + '1]=7;(_' + ch + '1)');
                        return 'a' === r;
                    } catch (e) { }
                    return false;
                });
            }
        };
    }());
    punctuators = '{ } ( ) [ ] . ; , < > <= >= == != === !== + - * % ++ ' +
        '-- << >> >>> & | ^ ! ~ && || ? : = += -= *= %= <<= >>= >>>= &= |= ' +
        '^='.split(/\s+/).sort(function (a, b) { return b.length - a.length; });
    divPunctuators = [ '/=', '/' ];
    keywords = ('break case catch class const continue debugger default ' +
        'delete do else enum export extends finally for function if import ' +
        'in instanceof new return super switch this throw try typeof var ' +
        'void while with').split(' ');

    State = (function () {
        function State(input) {
            this.index = 0;
            this.column = this.line = 1;
            this.input = input;
        }

        State.prototype.end = function () {
            return this.input.length <= this.index;
        };

        State.prototype.character = function () {
            return this.input[this.index];
        };

        State.prototype.test = function (criteria) {
            if (this.end()) {
                return false;
            }
            switch (typeof criteria) {
            case 'string':
                return this.index === this.input.indexOf(criteria, this.index);
            case 'function':
                return criteria(this.input[this.index], this.input, this.index);
            }
        };

        State.prototype.indexOf = function (substring, delta) {
            delta = delta || 0;
            var p = this.input.indexOf(substring, this.index + delta);
            return -1 === p ? -1 : (p + delta - this.index);
        };

        State.prototype.move = function () {
            var ch = this.input[this.index],
                prev = this.input[this.index - 1];
            if ('\u000D' === prev) {
                if ('\u000A' === ch || '\u000D' === ch || !chr.lt(ch)) {
                    this.column = 1;
                    this.line += 1;
                } else {
                    this.column = 1;
                    this.line += 2;
                }
            } else {
                if ('\u000D' === ch) {
                    this.column += 1;
                } else if (chr.lt(ch)) {
                    this.column = 1;
                    this.line += 1;
                } else {
                    this.column += 1;
                }
            }
            this.index += 1;
        };

        function readByCriteria(state, criteria) {
            var buffer = '';
            while (state.test(criteria)) {
                buffer += state.read();
            }
            return buffer || null;
        }

        function readByLength(st, length) {
            var len = Math.min(length, st.input.length - st.index),
                content = st.input.substr(st.index, len) || null;
            while (len--) {
                st.move();
            }
            return content;
        }

        function readByRegExp(st, regexp) {
            var match, len,
                re = new RegExp(regexp.source, (regexp.ignoreCase ? 'i' : '') +
                    (regexp.multiline ? 'm' : '') + 'g');
            re.lastIndex = st.index;
            match = re.exec(st.input);
            if (match === null || st.index !== match.index) {
                return null;
            }
            len = match[0].length;
            while (len--) {
                st.move();
            }
            return match[0];
        }

        State.prototype.read = function (crt) {
            switch (typeof crt) {
            case 'number':
                return readByLength(this, crt);
            case 'function':
                return readByCriteria(this, crt);
            case 'object':
                return (crt instanceof RegExp) ? readByRegExp(this, crt) : null;
            case 'undefined':
                return readByLength(this, 1);
            default:
                return null;
            }
        };

        State.prototype.readTk = function (property, criteria, properties) {
            var tk = this.tokenBase();
            tk.text = tk[property] = this.read(criteria);
            Object.keys(properties || {}).forEach(function (key) {
                tk[key] = properties[key];
            });
            return tk.text ? tk : null;
        };

        State.prototype.tokenBase = function () {
            return { position : this.index, line : this.line,
                column : this.column };
        };

        State.prototype.copy = function () {
            return new State(this.input).apply(this);
        };

        State.prototype.apply = function (state) {
            this.column = state.column;
            this.line = state.line;
            this.index = state.index;
            return this;
        };

        State.prototype.error = function (text) {
            var context = this.input.substr(this.index - 5, 10),
                error = new Error(text + ' (context: ' +
                    JSON.stringify(context) + ', character: ' +
                    JSON.stringify(this.input[this.index]) + ', line: ' +
                    this.line + ', column: ' + this.column + ')');
            error.text = text;
            error.line = this.line;
            error.column = this.column;
            error.context = context;
            throw error;
        };

        return State;
    }());

    function lineTerminator(st) {
        return st.test(chr.lt) && st.readTk('lt', 1 + st.test('\r\n')) || null;
    }

    function comment(st) {
        var pos, tk;
        if (st.test('/*')) {
            if (-1 === (pos = st.indexOf('*/', 2))) {
                st.error('Unclosed multiline comment');
            }
            tk = st.readTk('comment', pos, { multiline : true });
            tk.terminator = chr.lt(tk.comment);
            return tk;
        }
        return st.test('//') ? st.readTk('comment', chr.lt.not) : null;
    }

    function identifierName(st) {
        var tk;
        if (st.test(chr.idStart)) {
            tk = st.tokenBase();
            tk.text = tk.id = st.read() + (st.read(chr.idCont) || '');
            return tk;
        }
        return null;
    }

    function identifier(st) {
        var tk = identifierName(st);
        if (null !== tk && -1 !== keywords.indexOf(tk.id)) {
            tk.keyword = tk.id;
            delete tk.id;
        }
        return tk;
    }

    function punctuator(st) {
        var idx;
        for (idx = 0; idx < punctuators.length; idx += 1) {
            if (st.test(punctuators[idx])) {
                return st.readTk('pt', punctuators[idx].length);
            }
        }
        return null;
    }

    function numericLiteral(st) {
        return st.readTk('number',
            /(0x[\da-f]+|(0|[1-9]+(\.\d+)?|\.\d+)(e[+\-]?\d+)?)/i);
    }

    function stringLiteral(st) {
        var quote, buffer, tmp, token,
            esc = /\\(u[\dA-Fa-f]{4}|x[\dA-Fa-f]{2}|\r(?!\n)|\r\n|\n|[^ux])/;
        if (!st.test('"') && !st.test('\'')) {
            return null;
        }
        token = st.tokenBase();
        quote = buffer = st.read();
        do {
            if (st.end() || st.test(chr.lt)) {
                st.error('Unterminated string');
            }
            tmp = st.character();
            if ('\\' === tmp) {
                tmp = st.read(esc);
                if (null === tmp) {
                    st.error('Invalid escape sequence');
                }
                buffer += tmp;
                continue;
            }
            buffer += tmp;
            st.move();
            if (quote === tmp) {
                token.text = token.str = buffer;
                return token;
            }
        } while (true);
    }

    function regexpLiteral(st) {
        function nonterm(st, excl) {
            var ch = st.character();
            return (chr.lt(ch) || -1 !== excl.indexOf(ch)) ? null : st.read();
        }

        function backslash(st) {
            var local, ch;
            if (st.test('\\')) {
                local = st.copy();
                local.move();
                ch = nonterm(local, '');
                if (null === ch) {
                    return null;
                }
                st.apply(local);
                return '\\' + ch;
            }
            return null;
        }

        function clsChars(st) {
            var buffer = '', ch;
            do {
                ch = nonterm(st, ']\\') || backslash(st) || '';
                buffer += ch;
            } while ('' !== ch);
            return buffer;
        }

        function cls(st) {
            var local, ch, body;

            if (st.test('[')) {
                local = st.copy();
                local.move();
                body = clsChars(local);
                ch = local.read();
                if (']' === ch) {
                    st.apply(local);
                    return '[' + body + ']';
                }
                local.error('Incomplete regexp group.');
            }
            return null;
        }

        function chars(st) {
            var result = '', ch;
            do {
                ch = nonterm(st, '\\/[') || backslash(st) || cls(st) || '';
                result += ch;
            } while ('' !== ch);
            return result;
        }

        function body(st) {
            var firstChar = nonterm(st, '*\\/[') || backslash(st) || cls(st);
            return null === firstChar ? null : firstChar + chars(st);
        }

        var local, reBody, reFlags, tk;
        if (st.test('/')) {
            local = st.copy();
            tk = local.tokenBase();
            local.move();
            reBody = body(local);
            if (st.test('/')) {
                local.move();
                reFlags = local.read(chr.idCont) || '';
                tk.text = tk.re = '/' + reBody + '/' + reFlags;
                st.apply(local);
                return tk;
            }
        }
        return null;
    }

    function divPunctuator(st) {
        var idx;
        for (idx = 0; idx < divPunctuators.length; idx += 1) {
            if (st.test(divPunctuators[idx])) {
                return st.readTk('pt', divPunctuators[idx].length);
            }
        }
        return null;
    }

    function inputElementRegExp(st) {
        return st.readTk('ws', chr.ws) || lineTerminator(st) || comment(st) ||
            identifier(st) || punctuator(st) || numericLiteral(st) ||
            stringLiteral(st) || regexpLiteral(st);
    }

    function scan(input) {
        var state, tokens, tk, index, tkn;

        state = new State(input);
        tokens = [];
        while (!state.end()) {
            tk = inputElementRegExp(state);
            if (null === tk) {
                index = tokens.length;
                do {
                    index -= 1;
                    if (-1 === index) {
                        break;
                    }
                    tkn = tokens[index];
                    if (tkn.ws) {
                        continue;
                    }
                    if (tkn.pt && -1 !== '(,=:[!&|?{};'.indexOf(tkn.pt)) {
                        tk = divPunctuator(state);
                    } else {
                        tk = regexpLiteral(state);
                    }
                    break;
                } while (true);
                if (null === tk) {
                    state.error('Unexpected character');
                }
            }
            tokens.push(tk);
        }
        return tokens;
    }

    (function () {
        /*global module, window */
        if ('undefined' !== typeof module) {
            module.exports = scan;
        } else if ('undefined' !== typeof window) {
            (window.spelljs || (window.spelljs = {})).scan = scan;
        }
    }());
}());
