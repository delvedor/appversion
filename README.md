# appversion
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

**appversion** is intended as an extension of *npm version* and is a **cli tool** for keep track the *version*, *build*, *status* and *commit* of your javascript application.  
The project is built following [semver](http://semver.org/) guidelines.

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
  "status": {
    "stage": null,
    "number": 0
  },
  "build": {
    "date": null,
    "number": 0,
    "total": 0
  },
  "commit": null,
  "json": [],
  "ignore": []
}
```
As you can see, the version is divided in ```major```, ```minor``` and ```patch```, the build is divided in ```date```, ```number``` and ```total```, in addition, there's the status, who is divided in ```stage``` field, who can assume ```stable|rc|beta|alpha``` value and ```number```.  
The last two fields are, ```json```, is the list of the *json files* who appversion must update when you change the version number, and ```ignore```, that is the list of the *folders* that appversion must ignore.

**Needs Node.js >= 4.0.0**

## Install
Install the tool globally:  
```npm install appversion -g```

If you want to access the ```appversion.json``` inside your application, install the module also locally:  
```npm install appversion --save```

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
| set-version |  x.y.z  |   Sets a specific version number.  |
|                                                            |
| set-status  |  stable |   Set the status to stable.        |
|         |  rc     |   Set the status to rc.                |
|         |  beta   |   Set the status to beta.              |
|         |  alpha  |   Set the status to alpha.             |
|                                                            |
| init    |           |   Generates the appversion.json file.|
|                                                            |
| help    |           |   Prints the commands list.          |

Some usage examples:   
```
$ apv update minor
$ apv set-version 1.3.2
$ apv set-status rc.2
```

By default, appversion updates the *"version"* field in the `package.json` and `bower.json` files; if you want to update the *"version"* field in more json files, just add the file name inside *appversion.json* in the json array field.

Appversion searchs recursively inside all the subfolders of your project for json files, by default it ignores `node_modules`, `bower_components` and `.git` folders; if you want to ignore more folders just add the folder name inside *appversion.json* in the ignore array field.

### In app:

| Function                                               |       |
|--------------------------------------------------------|-------|
| <a href="#getAppVersion">getAppVersion()</a>           | async |
| <a href="#getAppVersionSync">getAppVersionSync()</a>   | sync  |
| <a href="#composePattern">composePattern()</a>         | async |
| <a href="#composePatternSync">composePatternSync()</a> | sync  |

<a name="getAppVersion"></a>
#### getAppVersion(callback)
Returns the content of appversion.json as a object.  
This is the asyncronous version, so you must pass a callback to the function.

<a name="getAppVersionSync"></a>
#### getAppVersionSync()
Returns the content of appversion.json as a object.  
This is the syncronous version, so you don't need to pass a callback to the function.

<a name="composePattern"></a>
#### composePattern(pattern, callback)
Return a string with the version following the pattern you passed as a input.  
pattern:

| **Pattern** |  **description** |
|:-----------:|:----------------:|
| **M**       |  version.major   |
| **m**       | version.minor    |
| **p**       | version.patch    |
| **S**       | status.stage     |
| **s**       | status.number    |
| **n**       | build.number     |
| **t**       | build.total      |
| **d**       | build.date       |
| **c**       | commit           |
| **.**       | separator        |
| **-**       | separator        |

The pattern must be a string, for example a pattern could be `'M.m.p-Ss n-d'`.  
This is the asyncronous version, so you must pass a callback to the function.

<a name="composePatternSync"></a>
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
})

console.log(apv.composePatternSync('M.m.p-Ss n-d'))

apv.composePattern('M.m.p-Ss n-d', function(ptt) {
  console.log(ptt)
})


// es6 - es2015:
import { getAppVersion, getAppVersionSync, composePattern, composePatternSync } from 'appversion'

console.log(getAppVersionSync())
console.log(getAppVersionSync().version)

getAppVersion((err, data) => {
  if (err) console.log(err)
  console.log(data)
})

console.log(composePatternSync('M.m.p-Ss n-d'))

composePattern('M.m.p-Ss n-d', (ptt) => {
  console.log(ptt)
})
```

## Automating
If you are using *npm scripts* you can easily integrate appversion in your workflow, below you can find an example of a package.json:
```json
...
"scripts": {
  "build": "<build command> && apv update build"
},
...
```
## TODO
- [x] Update status number
- [ ] Integration with GitHub
- [ ] SHA generator
- [ ] Badge generator with the application version for the README.md.

## Build
```
$ npm install
$ chmod u+x apv.js
$ npm test

$ ./apv.js <cmd> <args>
```

## Contributing
If you feel you can help in any way, be it with examples, extra testing, or new features please open a pull request or open an issue.  

The code follows the Standard code style.  
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


______________________________________________________________________________________________________________________
## License
The code is released under the GPLv2 license.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
