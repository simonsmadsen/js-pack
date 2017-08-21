# js-pack

Javascript package for js-web framework.

http://js-web-framework.com

https://www.npmjs.com/package/js-web

## docs

https://js-web-framework.com/docs/injections

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes.


### Installing

A step by step series of examples that tell you have to get a development env running


```
npm install js-pack
```

Code example

```
try {
  pack.pack([
    pack.scriptCDN('https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'),
    pack.jsx('react','compile.js'),
    pack.babel('site','site.js'),
    pack.scriptFile('index.js'),
    pack.sass('sass/index.sass')
  ],'assets/bundle.js','assets/bundle.css')
} catch (err) {
  console.log(err)
}
```

## API

Overview over js-pack api

### Style

```
cssFile(file)
cssCDN(url)
sass(file)
stylus(file)
```

### Script

```
scriptFile(file)
scriptCDN(url)
babel(folder,index)
jsx(folder,index)
```
### Bundle/Pack
```
pack(arrOfInjections,scriptOut,styleOut)
```
