'use strict';

const {print} = require('recast');

const fixStrictMode = (a) => a.replace(`\n\n\n'use strict'`, `\n\n'use strict'`);

module.exports = (ast) => {
    const printOptions = {
        quote: 'single',
        objectCurlySpacing: false,
    };
    
    const printed = print(ast, printOptions).code;
    const code = fixStrictMode(printed);
    
    return code;
};

