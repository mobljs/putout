'use strict';

const traverse = require('@babel/traverse').default;
const {generate} = require('@putout/engine-parser');

const runFix = require('./run-fix');
const {getPosition} = require('./get-position');

const shouldSkip = (a) => !a.parent;
const {merge} = traverse.visitors;

module.exports = (pluginsToMerge, {fix, shebang, template}) => {
    const mergeItems = [];
    const pushed = {};
    
    for (const {rule, plugin, msg, options} of pluginsToMerge) {
        const {push, pull} = getStore(plugin, {
            fix,
            rule,
            shebang,
            msg,
        });
        
        pushed[rule] = pull;
        
        const visitor = plugin.traverse({
            push,
            generate,
            options,
        });
        
        mergeItems.push(...template({
            rule,
            visitor,
            options,
        }));
    }
    
    const entries = Object.entries(pushed);
    const visitor = {
        shouldSkip,
        ...merge(mergeItems),
    };
    
    return {
        entries,
        visitor,
    };
};

function getStore(plugin, {fix, rule, shebang, msg}) {
    let value = [];
    
    const push = (path) => {
        const position = getPosition(path, shebang);
        const message = msg || plugin.report(path);
        
        value.push({
            message,
            position,
        });
        
        runFix(fix, plugin.fix, {
            path,
            rule,
            position,
        });
    };
    
    const pull = () => {
        const a = value;
        value = [];
        return a;
    };
    
    return {
        push,
        pull,
    };
}

