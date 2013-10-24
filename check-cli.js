var check = require('./src/check.js'),
    fs = require('fs'),
    file;

if (process.argv.length < 3) {
    console.log('Usage: node check-cli.js file.js');
}

file = process.argv[2];
check(fs.readFileSync(file, 'utf8'), {
    rules : {
        // more words
        dictionary : {
            ignore : [
                // parsed as "is Na N" so it is better to ignore the whole name
                'isNaN'
            ],
            extras : [
                // javascript-specific words
                'abs,concat,json,substr,substring,unescape,unshift,stringify,' +
                    'pow,eval',
                // node.js-specific words
                'argv,dirname,fs,sync,util',
                // DOM-specific words
                'autoscroll,onreadystatechange,mouseleave,mouseenter,' +
                    'onload,onclick,textarea,checkbox,onerror,nodeset',
                // abbreviations, terms, and names
                'uid,url,uri,msie,css,html,webkit,http,https,jsonp,xsrf',
                // some words and terms missing in dictionary
                'bindable,' +
                    'callback,callbacks,' +
                    'config,' +
                    'databound,' +
                    'deferreds,' +
                    'denormalize,' +
                    'eventmap,' +
                    'expando,' +
                    'formated,' +
                    'hostname,hostnames,' +
                    'ident,' +
                    'interceptors,' +
                    'iterator,iterators,' +
                    'lexer,' +
                    'multiline,' +
                    'normalize,normalized,' +
                    'pluralize,' +
                    'poller,' +
                    'prepend,' +
                    'preprocess,' +
                    'punctuators,' +
                    'replacer,' +
                    'sanitization,sanitizer,' +
                    'setup,' +
                    'servicename,' +
                    'timezone,timezones,' +
                    'transclude,transcludes,transclusion,' +
                    'validator,validators,' +
                    'whens,' +
                    'whitelist,whitelists,' +
                    'whitespace',
                // They are short, but developers like them and most of the
                // developers understand them well. Of course, 'zzz' is not
                // right name to include to this list.
                'app,' +
                    'arg,args,' +
                    'attr,attrs,' +
                    'ch,' +
                    'chr,' +
                    'ctrl,ctrls,' +
                    'def,defs,' +
                    'dealoc,' +
                    'decl,' +
                    'diff,' +
                    'dst,' +
                    'elem,elems,' +
                    'evt,' +
                    'enum,' +
                    'eq,' +
                    'esc,' +
                    'evaled,' +
                    'exp,' +
                    'expr,' +
                    'fn,fns,' +
                    'frac,' +
                    'href,' +
                    'ids,' +
                    'idx,' +
                    'img,' +
                    'init,' +
                    'int,' +
                    'len,' +
                    'lite,' +
                    'msg,' +
                    'neg,' +
                    'noop,' +
                    'num,' +
                    'obj,' +
                    'orig,' +
                    'param,params,' +
                    'pos,' +
                    'prev,' +
                    'ptr,' +
                    'reg,' +
                    'regex,regexp,' +
                    'req,' +
                    'res,resp,' +
                    'sep,' +
                    'src,' +
                    'stat,stats,' +
                    'str,' +
                    'suf,' +
                    'tmp,' +
                    'tpl,' +
                    'ttl,' +
                    'tz,' +
                    'val,' +
                    'xhr',
                // that's me :)
                'spelljs'
            ].join(',').split(',')
        },
        // everybody use them as first index, second index and exception
        shortName : { exceptions : 'i,j,e'.split(',') }
    }
}).forEach(function (item) {
    console.log(file + ': line ' + item.line + ', col ' + item.column + ', ' +
        item.message);
});