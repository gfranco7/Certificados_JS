/* eslint-env node */
module.exports = {
	extends: [
		'@eslint/js',
	],
	overrides: [
		{
			files: ['**/*.{js,jsx}'],
			env: { browser: true, es2022: true },
			parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
			rules: {
				'react-refresh/only-export-components': 'off'
			}
		}
	]
}


