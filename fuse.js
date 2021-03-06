const { FuseBox, ReplacePlugin, QuantumPlugin } = require('fuse-box');
const TypeHelper = require('fuse-box-typechecker').TypeHelper;
const isProduction = process.env.NODE_ENV === 'production';
const version = require('./package.json').version;

const typeHelper = TypeHelper({
    tsConfig: './tsconfig.json',
    basePath: './',
    tsLint: './tslint.json',
    name: 'App typechecker',
});

const fuse = FuseBox.init({
    globals: { stricter: '*' },
    package: {
        name: 'stricter',
        entry: 'src/index.js',
    },
    plugins: [
        ReplacePlugin({
            'process.env.STRICTER_VERSION': JSON.stringify(version),
        }),
        QuantumPlugin({
            target: 'npm',
            bakeApiIntoBundle: 'index',
            containedAPI: true,
            treeshake: true,
        })
    ],
    homeDir: 'src',
    output: 'lib/$name.js',
});

const bundle = fuse
    .bundle('index')
    .instructions(`>[index.ts]`);

if (!isProduction) {
    bundle.watch().cache(false);
}

bundle.completed(proc => {
    console.log(`\x1b[36m%s\x1b[0m`, `application bundled`);
    typeHelper.runSync();
});

fuse.run();
