'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scriptCDN = scriptCDN;
exports.cssCDN = cssCDN;
exports.sass = sass;
exports.stylus = stylus;
exports.jsx = jsx;
exports.babel = babel;
exports.cssFile = cssFile;
exports.cssRAW = cssRAW;
exports.scriptRAW = scriptRAW;
exports.scriptFile = scriptFile;
exports.pack = pack;
const r = require('request');
const fs = require('fs');
const jquery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
const util = require('util');
const exec = require('child_process').exec;
const fileExists = file => fs.existsSync(file);
let node_sass = '"./node_modules/.bin/node-sass"';
let uglifyjs = './node_modules/.bin/uglifyjs';
let _jsx = (folder, out) => './node_modules/.bin/babel ' + folder + '  --out-dir ' + out + ' --plugins=transform-react-jsx,transform-es2015-classes,transform-es2015-modules-commonjs';
let _babel = (folder, out) => './node_modules/.bin/babel ' + folder + '  --out-dir ' + out + ' --plugins=transform-es2015-classes,transform-es2015-modules-commonjs';
let webpack = (folder, out) => './node_modules/.bin/webpack ' + folder + ' ' + out;
let _stylus = './node_modules/.bin/stylus ';
let removeFile = file => 'rm ' + file;
let removeFolder = folder => 'rm -R ' + folder;
let mkdir = folder => 'mkdir ' + folder;
let folderStart = '/';
const ran = _ => Math.floor(Math.random() * 1000 + 1);

var isWin = /^win/.test(process.platform);
if (isWin) {
  node_sass = '"./node_modules/.bin/node-sass"';
  uglifyjs = '"./node_modules/.bin/uglifyjs"';
  _jsx = (folder, out) => '"./node_modules/.bin/babel" "' + folder + '"  --out-dir "' + out + '" --plugins=transform-react-jsx,transform-es2015-classes,transform-es2015-modules-commonjs';
  _babel = (folder, out) => '"./node_modules/.bin/babel" "' + folder + '"  --out-dir "' + out + '" --plugins=transform-es2015-classes,transform-es2015-modules-commonjs';
  webpack = (folder, out) => '"./node_modules/.bin/webpack" "' + folder + '" "' + out + '"';
  _stylus = '"./node_modules/.bin/stylus" ';
  removeFile = file => 'del "' + file + '"';
  removeFolder = folder => 'rmdir /s /q "' + folder + '"';
  mkdir = folder => 'mkdir "' + folder + '"';
  folderStart = '\\';
}

const run = call => {
  return new Promise((resolve, reject) => {
    exec(call, (error, stdout, stderr) => {
      if (stderr) {
        console.log(stderr);
      }
      if (error) {
        //console.log(error)
      }
      resolve(stdout);
    });
  });
};

const downloadCDN = async (url, typeFunc) => {
  return new Promise((resolve, reject) => {
    r({ url: url }, (error, response, body) => {
      resolve(new typeFunc(body));
    });
  });
};

function Script(data) {
  this.data = data;
}

function scriptCDN(url) {
  return downloadCDN(url, Script);
}

function Style(data) {
  this.data = data;
}

function cssCDN(url) {
  return downloadCDN(url, Style);
}

function sass(file) {
  const out = __dirname + folderStart + 'temp' + ran() + '.css';
  return run(node_sass + ' ' + file + ' ' + out).then(r => {
    const data = fs.readFileSync(out, 'utf8');
    run(removeFile(out));
    return Promise.resolve(new Style(data));
  });
}
function stylus(file) {
  const out = __dirname + folderStart + 'temp' + ran() + '.css';
  return run(_stylus + ' ' + file + ' -o ' + out).then(r => {
    const data = fs.readFileSync(out, 'utf8');
    run(removeFile(out));
    return Promise.resolve(new Style(data));
  });
}

async function jsx(folder, index) {
  const out = __dirname + folderStart + 'tempjsx' + ran();
  await run(mkdir(out));
  await run(_jsx(folder, out));
  await run(webpack(out + folderStart + index, out + folderStart + 'js-web-linked-packed.js'));
  const data = fs.readFileSync(out + folderStart + 'js-web-linked-packed.js', 'utf8');
  await run(removeFile(out + folderStart + 'js-web-linked-packed.js'));
  await run(removeFolder(out));
  return new Script(data);
}

async function babel(folder, index) {
  const out = __dirname + folderStart + 'tempjsx' + ran();
  await run(mkdir(out));
  await run(_babel(folder, out));
  await run(webpack(out + folderStart + index, out + folderStart + 'js-web-linked-packed.js'));
  const data = fs.readFileSync(out + folderStart + 'js-web-linked-packed.js', 'utf8');
  await run(removeFolder(out));
  return new Script(data);
}

function cssFile(file) {
  const data = fs.readFileSync(file, 'utf8');
  return new Style(data);
}

function cssRAW(css) {
  return new Style(css);
}

function scriptRAW(script) {
  return new Script(script);
}

function scriptFile(file) {
  const data = fs.readFileSync(file, 'utf8');
  return new Script(data);
}

const handleInjection = async injection => {
  switch (injection.constructor.name) {
    case 'AsyncFunction':
      handleInjection(injection);
      break;
    case 'Function':
      handleInjection(injection);
      break;
    case 'Promise':
      const d = await injection;
      return handleInjection(d);
      break;
    case 'Script':
      return [true, injection.data];
      break;
    case 'Style':
      return [false, injection.data];
      break;
    default:
      return [true, data];
  }
};

async function pack(arrOfInjections, scriptOut, styleOut) {
  var script = '';
  var style = '';

  for (let i = 0; i < arrOfInjections.length; i++) {
    const [isScript, data] = await handleInjection(arrOfInjections[i]);

    if (isScript) {
      script += data;
    } else {
      style += data;
    }
  }

  if (script.trim() !== '') {
    fs.writeFileSync(scriptOut, script);
    //const t = await run(uglifyjs+ ' bundle.js --output bundle.js')
  }

  if (style.trim() !== '') {
    fs.writeFileSync(styleOut, style);
  }
}