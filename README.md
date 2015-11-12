# appversion
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

**appversion** is a **cli tool** for keep track the *version*, *build* and *commit* of your javascript application.  
Project built following [semver](http://semver.org/) guidelines.

Usually a project has different configuration/package-manager files, such as *package.json* and/or *bower.json*, and can be really tedious update the project number in every file.  
Here comes to help appversion, an easy to use command line tool who updates all the files for you.  
In addition appversion keeps track of the build date and number.

The tool creates a json file named ```appversion.json``` in the root of your project with the following structure:
```json
{
  "version": {
    "major": 0,
    "minor": 0,
    "patch": 0
  },
  "status": null,
  "build": {
    "date": null,
    "number": 0,
    "total": 0
  },
  "commit": null,
  "json": [
    "package.json",
    "bower.json"
  ]
}
```
As you can see, the version is divided in ```major```, ```minor``` and ```patch```, the build is divided in ```date```, ```number``` and ```total```, in addition, there's the ```status``` field, who can assume ```stable|rc|beta|alpha``` value.  
The last field, ```json```, is the list of the *json files* who appversion must update when you change the version number, is not available via the import.

The code is written in javascript es6 and compiled in es5 via [babel.io](https://babeljs.io/).

## Install
Install the tool globally:  
```npm install appversion -g```

If you want to access the ```appversion.json``` inside your application, install the module also locally:  
```npm install appversion```

## Usage
### CLI:
```$ apv <cmd> <args>```  

Commands list:

| **cmd** |  **args** |   **description**
|:-------:|:---------:|:------------------------------------:|
| update  |  major    |   Updates major number.              |
|         |  minor    |   Updates minor number.              |
|         |  patch    |   Updates patch number.              |
|         |  build    |   Updates build number.              |
|         |  commit   |   Updates commit code.               |
|                                                            |
| version |  "x.y.z"  |   Sets a specific version number.    |
|                                                            |
| status  |  "stable" |   Set the status to stable.          |
|         |  "rc"     |   Set the status to rc.              |
|         |  "beta"   |   Set the status to beta.            |
|         |  "alpha"  |   Set the status to alpha.           |
|                                                            |
| init    |           |   Generates the appversion.json file.|
|                                                            |
| help    |           |   Prints the commnds list.           |

Usage example:   
```$ apv update minor```

By default appversion tries to update all the json file you put in appversion.json
by searching recursively for these files starting from the current working directory.  
If you want that appversion ignores some folder (it automatically excludes `node_modules` and `bower_component`) just add the ignore argument in this way:  
`ignore="somefolder"`   
If you want to ignore more than one folder just use `|`.  
`ignore="folder1|folder2"`

| **cmd** |  **args** |   **args**
|:-------:|:---------:|:------------------------------------:|
| update  |  major    |   ignore="somefolder"                |
|         |  minor    |                                      |
|         |  patch    |                                      |
|                                                            |
| version |  "x.y.z"  |   ignore="somefolder"                |

Full example:  
`apv version "1.1.0" ignore="folder1|folder2"`

### In app:

| Function            |       |
|---------------------|-------|
| getAppVersion()     | async |
| getAppVersionSync() | sync  |
| compose()           | async |
| composeSync()       | sync  |

#### getAppVersion(callback)
Returns the content of appversion.json as a object.  
This is the asyncronous version, so you must pass a callback to the function.

#### getAppVersionSync()
Returns the content of appversion.json as a object.  
This is the syncronous version, so you don't need to pass a callback to the function.

#### composePattern(pattern, callback)
Return a string with the version following the pattern you passed as a input.  
pattern:
- **M** : mayor
- **m** : minor
- **p** : patch
- **s** : status
- **n** : build number
- **t** : build total
- **d** : build Date
- **c** : commit
- **.** : separator
- **-** : separator
The pattern must be a string, for example a pattern could be `'M.m.p-s n-d'`.  
This is the asyncronous version, so you must pass a callback to the function.

#### composePatternSync(pattern)
Return a string with the version following the pattern you passed as a input.  
The pattern string follow the same rules as above.  
This is the syncronous version, so you don't need to pass a callback to the function.

Sometimes you want to have the version/build number accessible in your application, for this, you can use the module with a standard import:  

```javascript
// es5:
var apv = require('appversion')

console.log(apv.getAppVersionSync())
console.log(apv.getAppVersionSync().version)

apv.getAppVersion(function (err, data) {
  if (err) console.log(err)
  console.log(data)
});

console.log(apv.composePatternSync('M.m.p-s n-d'))

apv.composePattern('M.m.p-s n-d', function(ptt) {
  console.log(ptt)
});


// es6 - es2015:
import { getAppVersion, getAppVersionSync, composePattern, composePatternSync } from 'appversion'

console.log(getAppVersionSync())
console.log(getAppVersionSync().version)

getAppVersion(function (err, data) {
  if (err) console.log(err)
  console.log(data)
});

console.log(composePatternSync('M.m.p-s n-d'))

composePattern('M.m.p-s n-d', function(ptt) {
  console.log(ptt)
})
```

## Automating
If you are using *npm scripts* you can easily integrate appversion in your workflow, below you can find an example of a package.json:
```json
...
"scripts": {
  "build": "apv update build && <build command>"
},
...
```

## Build
```
$ npm install
$ npm run build:cli
$ npm run build:index
$ chmod u+x cli.js
$ npm run test

$ ./cli.js <args>
```

## Contributing
If you feel you can help in any way, be it with examples, extra testing, or new features please open a pull request or open an issue.  

The code follow the Standard code style.  
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


______________________________________________________________________________________________________________________
## License
The code is released under the GPLv2 license.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
