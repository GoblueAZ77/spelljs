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
                    'pow',
                // node.js-specific words
                'argv,dirname,fs,sync',
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
                    'normalize,normalized,' +
                    'poller,' +
                    'pluralize,' +
                    'prepend,' +
                    'preprocess,' +
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
                // they are short, but developers like them
                'app,' +
                    'arg,args,' +
                    'attr,attrs,' +
                    'ch,' +
                    'ctrl,ctrls,' +
                    'def,defs,' +
                    'dealoc,' +
                    'decl,' +
                    'diff,' +
                    'dst,' +
                    'elem,elems,' +
                    'enum,' +
                    'eq,' +
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
                    'tpl,' +
                    'ttl,' +
                    'tz,' +
                    'val,' +
                    'xhr'
            ].join(',').split(',')
        },
        shortName : { enabled : false }
    }
}).forEach(function (item) {
    console.log(file + ': line ' + item.line + ', col ' + item.column + ', ' +
        item.message);
});