// node_modules
var gulp = require('gulp'),
	globby = require('globby'),
	path = require('path'),
	fs = require('fs-extra'),
	url = require('url'),
	browserSync = require('browser-sync').create(),
	crypto = require('crypto'),
	del = require('del'),
	runSequence = require('run-sequence'),
	imageminPngquant = require('imagemin-pngquant'),
	ejs = require('ejs'),
	sassdoc = require('sassdoc'),
	jsdom = require('jsdom'),
	JSDOM = jsdom.JSDOM;

// gulp_plugins
var spritesmith = require('gulp.spritesmith'),
	sourcemaps = require('gulp-sourcemaps'),
	sass = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	imagemin = require('gulp-imagemin'),
	postcss = require('gulp-postcss'),
	data = require('gulp-data'),
	gulpSort = require('gulp-sort'),
	uitIndex = require('gulp-nts-uit-index-helper'),
	changed = require('gulp-changed'),
	sassLint = require('gulp-sass-lint'),
	legacyIeCssLint = require('gulp-legacy-ie-css-lint'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css'),
	svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin');

	
// postcss plugins
var autoprefixer = require('autoprefixer');
var ntsFormatter = require('postcss-nts-formatter');

//paths
var dirNames = {
	src: 'src',
	scss: 'scss',
	css: 'css',
	template: 'template',
	img: 'img',
	sprite: 'sprite',
	svgSprite: 'svg-sprite'
};

var paths = {
	src: dirNames.src,
	scss: path.join(dirNames.src, dirNames.scss),
	css: path.join(dirNames.src, dirNames.css),
	template: path.join(dirNames.src, dirNames.template),
	img: path.join(dirNames.src, dirNames.img),
	sprite: path.join(dirNames.src, dirNames.sprite),
	svgSprite: path.join(dirNames.src, dirNames.svgSprite)
}

var static_url = 'https://ssl.pstatic.net/static/kin/section/sprite/';
var static_iconfont_url = 'https://ssl.pstatic.net/static/kin/iconfont/';

var config_autoprefixer = {
	browsers:['ie > 8','edge > 0', 'last 2 chrome versions', 'last 2 firefox versions', 'last 2 safari versions']
};

var plumber_func = function (error) {
	console.log(error);
	this.emit('end');
};

function browserSyncRun () {
	browserSync.init({
		server: {
			baseDir: './src',
			directory: true,
		},
		ghostMode: false,
		open: 'external'
	});
}

gulp.task('default',['watch']);
gulp.task('dev', (cb) => {
	runSequence('clean', ['html', 'sprite', 'svg-sprite', 'iconfont'], ['sass', 'index'] ,cb);
})
gulp.task('build', (cb) => {
	runSequence('clean', ['html', 'sprite-build', 'svg-sprite-build', 'iconfont-build'], 'sass-lint', 'sass-build', 'index', cb);
});

gulp.task('watch',['dev'], () => {
	browserSyncRun();

	gulp.watch(path.join(paths.scss,'/**/*.scss'), ['sass', 'sass-lint']);
	gulp.watch(path.join(paths.sprite,'/**/*.png'), ['sprite']);
	gulp.watch(path.join(paths.svgSprite,'/**/*.svg'), ['svg-sprite']);
	gulp.watch(path.join(paths.template,'/**/*.ejs'), () => {
		runSequence('html', 'index');
	});
});

// sass Task.
gulp.task('sass',() => {
	makeMergeScss();

	return gulp.src(path.join(paths.scss,'/*.scss'))
		.pipe(plumber(plumber_func))
		.pipe(sassdoc())
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1
		}).on('error', sass.logError))
		.pipe(legacyIeCssLint({
			throw: false
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(changed(paths.css, {hasChanged: changed.compareContents, extension: '.css'}))
		.pipe(gulp.dest(paths.css))
		.pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('sass-build',() => {
	makeMergeScss();

	return gulp.src(path.join(paths.scss,'/*.scss'))
		.pipe(plumber(plumber_func))
		.pipe(sassdoc())
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(data(function (file) {
			var replaced = file.contents.toString().replace(/-webkit-box-orient: vertical;/gim, '/* autoprefixer: ignore next */\n-webkit-box-orient: vertical;');
			file.contents = new Buffer(replaced);
			return file;
		}))
		.pipe(postcss([autoprefixer(config_autoprefixer)]))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(legacyIeCssLint({
			throw: false
		}))
		.pipe(postcss([ntsFormatter()]))
		.pipe(gulp.dest(paths.css));
});

gulp.task('sass-lint', () => {
	let file = fs.createWriteStream('src/lint_sass.html');
	
	return gulp.src(['default/*.scss', 'common/*.scss', 'end/*.scss', 'other/*.scss', 'components/*.scss'], {cwd: paths.scss})
		.pipe(plumber(plumber_func))
		.pipe(sassLint({
			options: {
				formatter: 'html'
			}
		}))
		.pipe(sassLint.format(file))
		.on('end', () => file.end());
});

function makeMergeScss () {
	let defaultImport = () => {return [`@import 'sprite/sprite';`, `@import 'svg-sprite/sprite';`, `@import 'iconfont/iconfont';`]};
	let scssContent = {
		common: defaultImport(),
		end: defaultImport(),
		other: defaultImport(),
		likeit: defaultImport(),
		components: defaultImport()
	};
	let scssList = globby.sync(['default/**/*.scss'].concat(Object.keys(scssContent).map((value) => {return value+'/**/*.scss'})), {cwd: paths.scss});
	scssList.sort((a, b) => {
		let aResult = a.match(/^default/) ? 1 : 0;
		let bResult = b.match(/^default/) ? 1 : 0;

		if (aResult === 0 && bResult === 0) {
			return a.localeCompare(b);
		} else {
			return bResult - aResult;
		}
	}).forEach((value) => {
		value = value.replace(/\.scss$/i, '');
		if (value.match(/^default\//)) {
			scssContent.common.push(`@import '${value}';`);

			if (!value.match('_base')) {
				for (key in scssContent) {
					if (['common', 'likeit'].includes(key)) continue;
					scssContent[key].push(`@import '${value}';`);	
				}
			}
		} else {
			let dir;
			if (dir = value.match(/^(.*?)\//)) {
				if (scssContent[dir[1]]) {
					scssContent[dir[1]].push(`@import '${value}';`);
				}
			}
		}
	});
	for (const scssName in scssContent) {
		if (scssContent.hasOwnProperty(scssName)) {
			const element = scssContent[scssName];
			element.push('');
			fs.outputFileSync(path.join(paths.scss, `${scssName}.scss`), element.join('\n'));
		}
	}
}

// sprite Task.
gulp.task('sprite',() => {
	return globby('**/*.png', {cwd: paths.sprite, transform: (entry) => path.dirname(entry)})
	.then((dirList) => {
		let promiseArray = [];
		let mapList = '';
		let spriteScss = '';

		dirList.sort().forEach((dirName) => {
			let spriteData = gulp.src(path.join(paths.sprite, dirName, '*.png'))
				.pipe(plumber(plumber_func))
				.pipe(gulpSort())
				.pipe(spritesmith({
					imgName: dirName+'.png',
					cssName: '_'+dirName+'.scss',
					imgPath: path.posix.join(path.relative(paths.scss,paths.img),dirName+'.png'),
					cssTemplate: 'sprite_template.hbs',
					padding: 4,
					cssSpritesheetName: dirName
				}));
			let imgPromise = new Promise((resolve, reject) => {
				spriteData.img
				.pipe(gulp.dest(paths.img))
				.on('end', resolve)
				.on('error', reject);
			});
			let scssPromise = new Promise((resolve, reject) => {
				spriteData.css
				.pipe(gulp.dest(paths.scss+'/sprite'))
				.on('end', resolve)
				.on('error', reject);
			});

			spriteScss += `@import '${dirName}';\n`;
			mapList += `\$${dirName}, `;

			promiseArray.push(imgPromise);
			promiseArray.push(scssPromise);
		});

		spriteScss += `\$map_list: ${mapList};\n\n@import 'sprite_mixin';`;

		promiseArray.push(fs.outputFile(path.join(paths.scss, '/sprite/_sprite.scss'), spriteScss));

		return Promise.all(promiseArray);
	});
});

gulp.task('sprite-build', ['sprite'],() => {
	return globby('**/*.png', {cwd: paths.sprite, transform: (entry) => path.dirname(entry)})
		.then((dirList) => {
			return Promise.all([fs.readJson(path.join(paths.sprite, 'hash.json')), dirList.sort()]);
		}).then((data) => {
			let spriteJson = data[0] ? data[0] : {};
			let dirList = data[1];

			let filePromises = dirList.map((dirName) => {
				let spFilePath = path.join(paths.img, dirName+'.png');

				return fs.readFile(spFilePath)
					.then(parseSpriteImg(dirName, spriteJson));
			});

			return Promise.all(filePromises)
				.then((minifyList) => {
					let promises = [];
					let minifyListFiltered = []
					minifyList.forEach((value) => {
						promises.push(value.scssPromise);
						if (value.result) {
							minifyListFiltered.push(value.result);
						}
					});
					let minifyPromise = new Promise((resolve, reject) => {
						gulp.src(minifyListFiltered, {base: paths.img})
						.pipe(imagemin([
							imageminPngquant({
								quality: '80-100',
								speed: 1,
							})
						], {verbose:true}))
						.pipe(gulp.dest(paths.img))
						.on('end', resolve)
						.on('error', reject);
					});
					promises.push(minifyPromise);
					promises.push(fs.writeJson(path.join(paths.sprite, 'hash.json'), spriteJson, {spaces: 2}));
					return Promise.all(promises);
				});
			});
});

function parseSpriteImg (dirName, spriteJson) {
	let spFileName = dirName+'.png';
	let spFilePath = path.join(paths.img, spFileName);
	let date = new Date();
	let yymmdd = [date.getFullYear().toString().slice(2,4),(date.getMonth() + 1 > 9 ? '' : '0') + (date.getMonth() + 1),(date.getDate() > 9 ? '' : '0') + date.getDate()].join('');

	return (imgFile) => {
		let shasum = crypto.createHash('sha1').update(imgFile).digest('hex');
		let findSameSprite = false;

		if (!spriteJson[spFileName]) {
			spriteJson[spFileName] = [];
		} else {
			findSameSprite = spriteJson[spFileName].find((value) => {
				return value.hash === shasum;
			});
		}

		if (!findSameSprite) {
			findSameSprite = {file: `${dirName}_${yymmdd}.png`, hash: shasum};
			if (spriteJson[spFileName].push(findSameSprite) > 5) {
				spriteJson[spFileName] = spriteJson[spFileName].shift();
			}
		}

		let result = false;

		if (fs.existsSync(path.join(paths.img, findSameSprite.file))) {
			fs.unlinkSync(spFilePath);
		} else {
			fs.renameSync(spFilePath, path.join(paths.img, findSameSprite.file));
			result = path.join(paths.img, findSameSprite.file);
		}

		let scssPromise = fs.readFile(path.join(paths.scss, `sprite/_${dirName}.scss`))
			.then((scssString) => {
				let posixSpritePath = path.posix.join(path.relative(paths.css, paths.img), `${dirName}.png`);
				let spriteStaticUrl = url.resolve(static_url, findSameSprite.file);
				scssString = scssString.toString().replace(posixSpritePath, spriteStaticUrl).replace(/\r\n/gmi, '\n');
				return fs.writeFile(path.join(paths.scss, `sprite/_${dirName}.scss`), scssString);
			});

		return {result: result, scssPromise: scssPromise};
	}
}

// svg-sprite Task.
gulp.task('svg-sprite',() => {
	return globby('**/*.svg', {cwd: paths.svgSprite, transform: (entry) => path.dirname(entry)})
		.then((dirList) => {
			let promiseArray = [];
			let mapList = '';
			let spriteScss = '';

			dirList.sort().forEach((dirName) => {
				let spriteData = new Promise((resolve, reject) => {
					gulp.src(path.join(paths.svgSprite, dirName, '*.svg'))
						.pipe(plumber(plumber_func))
						.pipe(gulpSort())
						.pipe(svgSprite({
							shape: {
								spacing: {
									padding: 0
								}
							},
							mode: {
								css: {
									dest: './',
									bust: false,
									sprite: dirName + '.svg',
									render: {
										scss: {
											template: 'sprite_svg_template.hbs',
											dest: path.posix.relative(paths.img, path.posix.join(paths.scss, 'svg-sprite', '_'+dirName+'.scss')),
										}
									}
								}
							},
							variables: {
								spriteSheetName: dirName,
								baseName: path.posix.relative(paths.css, paths.img) + '/' + dirName,
								sprite_ratio: 1,
							}
						}))
						.pipe(gulp.dest(paths.img))
						.on('end', resolve)
						.on('error', reject);
				})

				spriteScss += `@import '${dirName}';\n`;
				mapList += `\$${dirName}, `;

				promiseArray.push(spriteData);
			});

			spriteScss += `\$map_list: ${mapList};\n\n@import '../sprite/sprite_mixin';`;

			promiseArray.push(fs.outputFile(path.join(paths.scss, '/svg-sprite/_sprite.scss'), spriteScss));

			return Promise.all(promiseArray);
		});
});

gulp.task('svg-sprite-build', ['svg-sprite'],() => {
	return globby('**/*.svg', {cwd: paths.svgSprite, transform: (entry) => path.dirname(entry)})
		.then((dirList) => {
			return Promise.all([fs.readJson(path.join(paths.sprite, 'hash.json')), dirList.sort()]);
		}).then((data) => {
			let spriteJson = data[0] ? data[0] : {};
			let dirList = data[1];

			let filePromises = dirList.map((dirName) => {
				let spFilePath = path.join(paths.img, dirName+'.svg');
				return fs.readFile(spFilePath)
					// .then(parseSpriteSvg(dirName, spriteJson));
			});

			return Promise.all(filePromises)
				.then((minifyList) => {
					let promises = [];
					let minifyListFiltered = []
					minifyList.forEach((value) => {
						promises.push(value.scssPromise);
						if (value.result) {
							minifyListFiltered.push(value.result);
						}
					});
					let minifyPromise = new Promise((resolve, reject) => {
						gulp.src(minifyListFiltered, {base: paths.img})
						.pipe(svgmin())
						.pipe(gulp.dest(paths.img))
						.on('end', resolve)
						.on('error', reject);
					});
					promises.push(minifyPromise);
					promises.push(fs.writeJson(path.join(paths.sprite, 'hash.json'), spriteJson, {spaces: 2}));
					return Promise.all(promises);
				});
			});
});

function parseSpriteSvg (dirName, spriteJson) {
	let spFileName = dirName+'.svg';
	let spFilePath = path.join(paths.img, spFileName);
	let date = new Date();
	let yymmdd = [date.getFullYear().toString().slice(2,4),(date.getMonth() + 1 > 9 ? '' : '0') + (date.getMonth() + 1),(date.getDate() > 9 ? '' : '0') + date.getDate()].join('');

	return (imgFile) => {
		let shasum = crypto.createHash('sha1').update(imgFile).digest('hex');
		let findSameSprite = false;

		if (!spriteJson[spFileName]) {
			spriteJson[spFileName] = [];
		} else {
			findSameSprite = spriteJson[spFileName].find((value) => {
				return value.hash === shasum;
			});
		}

		if (!findSameSprite) {
			findSameSprite = {file: `${dirName}_${yymmdd}.svg`, hash: shasum};
			if (spriteJson[spFileName].push(findSameSprite) > 5) {
				spriteJson[spFileName] = spriteJson[spFileName].shift();
			}
		}

		let result = false;

		if (fs.existsSync(path.join(paths.img, findSameSprite.file))) {
			fs.unlinkSync(spFilePath);
		} else {
			fs.renameSync(spFilePath, path.join(paths.img, findSameSprite.file));
			result = path.join(paths.img, findSameSprite.file);
		}

		let scssPromise = fs.readFile(path.join(paths.scss, `svg-sprite/_${dirName}.scss`))
			.then((scssString) => {
				let posixSpritePath = path.posix.join(path.relative(paths.css, paths.img), `${dirName}.svg`);
				let spriteStaticUrl = url.resolve(static_url, findSameSprite.file);
				scssString = scssString.toString().replace(posixSpritePath, spriteStaticUrl).replace(/\r\n/gmi, '\n');
				return fs.writeFile(path.join(paths.scss, `svg-sprite/_${dirName}.scss`), scssString);
			});

		return {result: result, scssPromise: scssPromise};
	}
}

gulp.task('clean', () => {
	return del([path.join(paths.src, '*.html'), path.join(paths.src, 'components/*.html'), path.join(paths.css, '*.css'), path.join(paths.css, '*.css.map'), path.join('src/font/*.woff')]);
});

gulp.task('html',() => {
	return gulp.src([path.join(paths.template,'*.ejs'),path.join(paths.template,'/components/*.ejs')],{base: paths.template})
		.pipe(data((file, cb) => {
			var options = {filename: file.path, root: paths.template};
			var renderOption = {page: path.relative(paths.template, file.path), component: getComponent};
			try {
				let render = ejs.compile(file.contents.toString(), options);
				let htmlString = render(renderOption);
				file.contents = new Buffer(htmlString.replace(/\r\n/gmi, '\n'));
				file.path = file.path.replace(/\.ejs$/, '.html');
			} catch(e) {
				console.log(e);
				return cb(e);
			}
			cb(undefined, file);
		}))
		.pipe(changed(paths.src, {hasChanged: changed.compareContents, extension: '.html'}))
		.pipe(gulp.dest(paths.src))
		.on('end', browserSync.reload);
});

function getComponent (options, htmlString) {
	var opt = {
		remove: [],
		addClass: null
	};

	if (typeof options === 'string') {
		opt.selector = options;
	} else {
		opt = Object.assign(opt, options);
	}

	var frag = JSDOM.fragment(htmlString);
	var selectDom = frag.querySelector(opt.selector);
	if (!selectDom) {
		return '';
	}
	selectDom.removeAttribute('data-select');

	if (opt.addClass) {
		selectDom.classList.add(opt.addClass);
	}

	for (var i = 0; i < opt.remove.length; i++) {
		var removeSelector = '';
		var all = false;

		if (typeof opt.remove[i] === 'string') {
			removeSelector =  opt.remove[i];
		} else {
			removeSelector =  opt.remove[i].selector;
			all = opt.remove[i].all;
		}

		if (all) {
			var elements = selectDom.querySelectorAll(removeSelector);
			var elementLength = elements.length;

			for (var j = 0; j < elementLength; j++) {
				elements[j].remove();
			}
		} else {
			selectDom.querySelector(removeSelector).remove();
		}
	}
	
	var returnString = selectDom.outerHTML;

	if (selectDom.hasAttribute('data-selectin')) {
		selectDom.removeAttribute('data-selectin');
		returnString = selectDom.innerHTML;
	}

	return returnString;
}

gulp.task('index', () => {
	return gulp.src([path.join(paths.src, '*.html')])
		.pipe(uitIndex({
			fileSort: 'title'
		}))
		.pipe(gulp.dest(paths.src));
});

gulp.task('iconfont', () => {
	return gulp.src(path.join(paths.src, 'iconfont/*.svg'))
		.pipe(gulpSort())
		.pipe(iconfontCss({
			fontName: 'kin_iconfont',
			cssClass: 'kin_iconfont',
			path: path.join(paths.scss, 'iconfont/_iconfont_template.scss'),
			targetPath: '../scss/iconfont/_iconfont.scss',
			fontPath: '../font/'
		}))
		.pipe(iconfont({
			fontName: 'kin_iconfont',
			prependUnicode: true,
			centerHorizontally: true,
			formats: ['woff'],
			timestamp: 1
		}))
		.pipe(gulp.dest(path.join(paths.src, 'font/')));
});

gulp.task('iconfont-build', ['iconfont'],() => {
	let iconfontPath = 'src/font/';
	let fontFileName = 'kin_iconfont.woff';
	let fontFilePath = path.join(iconfontPath, fontFileName);
	let scssPath = path.join(paths.scss, 'iconfont/_iconfont.scss');
	let fontNewFileName = '';
	let shasum = '';

	return fs.readFile(fontFilePath)
		.then((fontFile) => {
			shasum = crypto.createHash('sha1').update(fontFile).digest('hex').substr(0, 6);
			fontNewFileName = fontFileName.replace(/\.woff$/, `_${shasum}.woff`);

			return fs.rename(fontFilePath, path.join(iconfontPath, fontNewFileName));
		}).then(() => {
			return fs.readFile(scssPath);
		}).then((scssString) => {
			let posixSpritePath = path.posix.join(path.relative(paths.css, iconfontPath), fontFileName);
			let iconfontStaticUrl = url.resolve(static_iconfont_url, fontNewFileName);
			scssString = scssString.toString().replace(posixSpritePath, iconfontStaticUrl).replace(/\r\n/gmi, '\n');

			return fs.writeFile(scssPath, scssString);
		})
});