import path from 'path'

export default {
	plugins: [],
	test: {
		globals: true,
		environment: 'jsdom',
	},
	resolve: {
		alias: {
			'@lib': path.resolve(__dirname, './lib')
		},
	},
}