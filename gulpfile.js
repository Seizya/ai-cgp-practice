/* eslint-disable */
const { dest, series, src, watch } = require("gulp")
const intermediate = require("gulp-intermediate")
const notify = require("gulp-notify")
const plumber = require("gulp-plumber")
const rename = require("gulp-rename")
const sourcemaps = require("gulp-sourcemaps")
const rollup = require("rollup").rollup

const rollup_plugins = [
	require("@rollup/plugin-node-resolve")(),
	require("rollup-plugin-commonjs")(),
	require("rollup-plugin-sourcemaps")(),
]

const error2notify = () => plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })

const dest_dir = "docs"

var rollup_cache
function task_ts() {
	return src(".tmp/ts/**/*.js", { base: ".tmp/ts" })
		.pipe(error2notify())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write())
		.pipe(intermediate({ output: "bundle" }, (tempDir, done) => {
			rollup({
				input: `${tempDir}/index.js`,
				treeshake: true,
				plugins: rollup_plugins,
				cache: rollup_cache
			}).then(bundle => {
				return bundle.write({
					file: `${tempDir}/bundle/index.js`,
					format: "iife",
					name: "index_js",
					sourcemap: "inline"
				})
			}).then(() => done())
				.catch(err => done(err))
		}))
		.pipe(rename("index.js"))
		.pipe(dest(dest_dir))
}
function task_watch(done) {
	watch(".tmp/ts/**/*", task_ts)
	done()
}
const task_build = task_ts
const task_serve = series(task_build, task_watch)

exports.watch = task_watch
exports.build = task_build
exports.default = exports.serve = task_serve
