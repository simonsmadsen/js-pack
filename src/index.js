const r = require('request')
const fs = require('fs')
const jquery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'
const util = require('util')
const exec = require('child_process').exec;
const fileExists = file => fs.existsSync(file)
const node_sass = './node_modules/.bin/node-sass'
const uglifyjs = './node_modules/.bin/uglifyjs'
const _jsx = (folder,out) => './node_modules/.bin/babel '+folder+'  --out-dir '+out+' --plugins=transform-react-jsx,transform-es2015-classes,transform-es2015-modules-commonjs'
const _babel = (folder,out) => './node_modules/.bin/babel '+folder+'  --out-dir '+out+' --plugins=transform-es2015-classes,transform-es2015-modules-commonjs'
const webpack = (folder,out) => './node_modules/.bin/webpack '+folder+' '+out
const _stylus =  './node_modules/.bin/stylus '
const ran = _ => Math.floor((Math.random() * 1000) + 1)

const run = call => {
  return new Promise( (resolve,reject) => {
    exec(call, (error, stdout, stderr) => {
      if(stderr){
        console.log(stderr)
      }
      if (error) {
        console.log(error)
      }
      resolve(stdout)
    })
  })
}

const downloadCDN = async (url,typeFunc) => {
  return new Promise( (resolve,reject) => {
    r({url: url},
      (error, response, body) => {
        resolve(new typeFunc(body))
    })
  })

}

function Script(data){
  this.data = data
}

export function scriptCDN(url){
  return downloadCDN(url,Script)
}

function Style(data){
  this.data = data
}

export function cssCDN(url){
  return downloadCDN(url,Style)
}

export function sass(file){
  const out = __dirname+'/temp'+ran()+'.css'
  return run(node_sass+' '+file+' '+out)
  .then(r => {
    const data = fs.readFileSync(out, 'utf8')
    run('rm '+out)
    return Promise.resolve(new Style(data))
  })
}
export function stylus(file){
  const out = __dirname+'/temp'+ran()+'.css'
  return run(_stylus+' '+file+' -o '+out)
  .then(r => {
    const data = fs.readFileSync(out, 'utf8')
    run('rm '+out)
    return Promise.resolve(new Style(data))
  })
}

export async function jsx(folder,index){
  const out = __dirname+'/tempjsx'+ran()
  await run('mkdir '+out)
  await run(_jsx(folder,out))
  await run(webpack(out+'/'+index,out+'/js-web-linked-packed.js'))
  const data = fs.readFileSync(out+'/js-web-linked-packed.js', 'utf8')
  await run('rm -R '+out)
  return new Script(data)
}

export async function babel(folder,index){
  const out = __dirname+'/tempbabel'+ran()
  await run('mkdir '+out)
  await run(_babel(folder,out))
  await run(webpack(out+'/'+index,out+'/i_temp.js'))
  const data = fs.readFileSync(out+'/i_temp.js', 'utf8')
  await run('rm -R '+out)
  return new Script(data)
}

export function cssFile(file){
  const data = fs.readFileSync(file, 'utf8')
  return new Style(data)
}

export function cssRAW(css){
  return new Style(css)
}

export function scriptRAW(script){
  return new Script(script)
}

export function scriptFile(file){
  const data = fs.readFileSync(file, 'utf8')
  return new Script(data)
}

const handleInjection = async (injection) => {
  switch(injection.constructor.name){
     case 'AsyncFunction':
       handleInjection(injection)
       break;
    case 'Function':
      handleInjection(injection)
      break;
    case 'Promise':
      const d = await injection
      return handleInjection(d)
      break;
    case 'Script':
      return [true,injection.data]
      break;
    case 'Style':
      return [false,injection.data]
      break;
    default:
     return [true,data]
  }
}

export async function pack(arrOfInjections,scriptOut,styleOut){
  var script = ''
  var style = ''

  for (let i = 0; i < arrOfInjections.length; i++) {
    const [isScript,data] =
      await handleInjection(arrOfInjections[i])

    if(isScript){
      script += data
    }else{
      style += data
    }
  }

  if(script.trim() !== ''){
    fs.writeFileSync(scriptOut,script)
    //const t = await run(uglifyjs+ ' bundle.js --output bundle.js')
  }

  if(style.trim() !== ''){
    fs.writeFileSync(styleOut,style)
  }

}