/** @type {import("prettier").Config} */
module.exports = {
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    quoteProps: 'as-needed',
    bracketSameLine: false,
    experimentalTernaries: false,
    singleAttributePerLine: false,
    overrides: [
        {
            files: '*.{json,yml,yaml}',
            options: {
                tabWidth: 2,
            },
        },
        {
            files: '*.md',
            options: {
                printWidth: 80,
                proseWrap: 'always',
            },
        },
    ],
};
