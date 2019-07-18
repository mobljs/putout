'use strict';

const {run} = require('madrun');

module.exports = {
    'clean': () => 'rm -rf lib',
    'build': () => 'babel src -d lib',
    'test': () => 'mocha --require @babel/register',
    'test:watch': () => run(['test'], '--watch'),
    'prepublish': () => run(['clean', 'build']),
    'watch:test': () => `nodemon -w src -w test -x ${run('test')}`,
    'lint:src': () => `eslint src test madrun.js --ignore-pattern test/fixture --ignore-pattern lib`,
    'lint': () => run(['putout', 'lint:*']),
    'fix:lint': () => run(['putout', 'lint:*'], '--fix'),
    'putout': () => `putout src test madrun.js`,
    'coverage': () => `nyc ${run('test')}`,
    'report': () => `nyc report --reporter=text-lcov | coveralls`,
    'debug': () => 'mocha --inspect-brk --inspect=0.0.0.0 -r @babel/register test/index.js',
};
