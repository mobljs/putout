'use strict';

const {red} = require('chalk');
const yargsParser = require('yargs-parser');

const merge = require('../merge');
const processFile = require('./process-file');
const getFiles = require('./get-files');
const cacheFiles = require('./cache-files');
const supportedFiles = require('./supported-files');

const isString = (a) => typeof a === 'string';
const isStringAll = (...a) => a.filter(isString).length;
const isRuler = (a) => a.disableAll || a.enableAll || isStringAll(a.disable, a.enable);

const {PUTOUT_FILES = ''} = process.env;
const envNames = !PUTOUT_FILES ? [] : PUTOUT_FILES.split(',');

module.exports = async ({argv, halt, log, write, logError}) => {
    const args = yargsParser(argv, {
        boolean: [
            'cache',
            'update-cache',
            'remove-cache',
            'version',
            'help',
            'fix',
            'raw',
            'enable-all',
            'disable-all',
            'jsx',
            'flow',
            'options',
            'staged',
        ],
        number: [
            'fixCount',
        ],
        string: [
            'ext',
            'config',
            'format',
            'disable',
            'enable',
            'rulesdir',
        ],
        alias: {
            v: 'version',
            h: 'help',
            c: 'config',
            f: 'format',
            s: 'staged',
        },
        default: {
            fix: false,
            fixCount: 10,
            options: true,
            updateCache: false,
            removeCache: false,
        },
    });
    
    supportedFiles.add(args.ext);
    
    const {
        fix,
        fixCount,
        raw,
        rulesdir,
        format,
        flow: isFlow,
        jsx: isJSX,
        disable,
        disableAll,
        enable,
        enableAll,
        staged,
        updateCache,
        removeCache,
    } = args;
    
    const exit = getExit({
        raw,
        halt,
        logError,
    });
    
    if (args.version) {
        log(`v${require('../../package.json').version}`);
        return exit();
    }
    
    if (args.help) {
        const help = require('./help');
        log(help());
        return exit();
    }
    
    const stagedNames = [];
    
    if (staged) {
        const {get} = require('./staged');
        const names = await get();
        
        stagedNames.push(...names);
    }
    
    const globFiles = [
        ...stagedNames,
        ...args._.map(String),
        ...envNames,
    ];
    
    const [e, files] = await getFiles(globFiles);
    
    if (e)
        return exit(e);
    
    if (!files.length)
        return exit();
    
    const fileCache = cacheFiles({
        files,
        cache: args.cache,
        updateCache,
        removeCache,
    });
    
    const options = {
        fix,
        fileCache,
        updateCache,
        removeCache,
        rulesdir,
        format,
        isFlow,
        isJSX,
        fixCount,
        raw,
        ruler: {
            disable,
            disableAll,
            enable,
            enableAll,
        },
        
        exit,
        log,
        logError,
        write,
        noOptions: !args.options,
    };
    
    const rawPlaces = [];
    
    const process = processFile(options);
    const {length} = files;
    
    for (let i = 0; i < length; i++) {
        const file = files[i];
        const place = await process(file, i, {length});
        rawPlaces.push(place);
    }
    
    const places = rawPlaces.filter(Boolean);
    const mergedPlaces = merge(...places);
    
    fileCache.reconcile();
    
    if (isRuler(args)) {
        const getRulerProcessor = require('./ruler-processor');
        const rulerProcessor = getRulerProcessor({
            log,
        });
        
        rulerProcessor(args, mergedPlaces);
        return exit();
    }
    
    if (fix && staged) {
        const {set} = require('./staged');
        await set();
    }
    
    if (mergedPlaces.length)
        return exit(1);
};

const getExit = ({halt, raw, logError}) => (e) => {
    if (!e)
        return halt(0);
    
    if (typeof e === 'number')
        return halt(e);
    
    if (raw)
        logError(e);
    else
        logError(red(e.message));
    
    halt(1);
};

