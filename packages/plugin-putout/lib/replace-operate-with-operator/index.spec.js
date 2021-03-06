'use strict';

const test = require('@putout/test')(__dirname, {
    'putout/replace-operate-with-operator': require('.'),
});

test('plugin-putout: replace-operate-with-operator: report', (t) => {
    t.report('operate', '"operator" should be used instead of "operate"');
    t.end();
});

test('plugin-putout: replace-operate-with-operator: transform', (t) => {
    t.transform('operate');
    t.end();
});

