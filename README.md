# AppVersion <a name="version"></a><a name="status"></a>
[![AppVersion-version](https://img.shields.io/badge/AppVersion-1.7.1-brightgreen.svg?style=flat)](https://github.com/delvedor/appversion?#version) [![AppVersion-status](https://img.shields.io/badge/Status-RC-brightgreen.svg?style=flat)](https://github.com/delvedor/appversion?#status) [![Build Status](https://travis-ci.org/delvedor/appversion.svg?branch=master)](https://travis-ci.org/delvedor/appversion) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

**AppVersion** is a CLI tool whose purpose is to provide a **unique manager** of the version of you application.  
It follows the **semver** guidelines, so the version of your code is divided in Major, Minor and Patch, [here](http://semver.org/) you can find the Semantic Versioning specification.  
In addition AppVersion keeps track of the **build** with the last build date, the build of the current version and the total number of build; it also keeps track of the **status** (stable, rc, ...) and the **commit code**.

AppVersion interacts with **NPM**, when you update the version using the AppVersion CLI tool, it updates automatically the *package.json* as well, and you can use the CLI commands inside your **NPM scripts**. See <a href="#automation">here</a> for more info about automation.  
Furthermore AppVersion works well with **Git**, indeed you can add a Tag with the current version of your application to the repository and you can add one badge with the version and one badge with the status of your application to the *README.md*.  
AppVersion also provides easy to use APIs to access your version, build, status and commit from your application.

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
  "config": {
    "appversion": "x.y.z",
    "markdown": [],
    "json": [],
    "ignore": []
  }
}
```
As you can see, the version is divided in ```major```, ```minor``` and ```patch```, the build is divided in ```date```, ```number``` and ```total```, in addition, there's the status, who is divided in ```stage``` field, who can assume ```stable|rc|beta|alpha``` (the first letter can be Uppercase) value and ```number```.  

Then, there's the ```config``` filed, divided in ```appversion```, that is used by AppVersion for check if the json is at the latest version, ```markdown``` field where you can put all the markdown files that you want to keep updated (see <a href="#generateBadge">here</a> for more information).  
The last two fields inside ```config``` are, ```json```, that is the list of the *json files* who appversion must update when you change the version number, and ```ignore```, that is the list of the *folders* that AppVersion must ignore.

**Needs Node.js >= 4.0.0**

## Install
Install the tool globally:  
```
npm install appversion -g
```

If you want to access the ```appversion.json``` inside your application, install the module also locally:  
```
npm install appversion --save
```

## Usage
### CLI:
```
$ apv <cmd> <args>
```  

Commands list:

| **cmd** |  **args** |   **description**
|:-------|:---------|:------------------------------------|
| update  |  major\breaking    |   Updates major number.  |
|         |  minor\feature    |   Updates minor number.   |
|         |  patch\fix    |   Updates patch number.       |
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
| generate-badge | version | Generates the .md code of a shield badge with the version of your application.
|                | status  | Generates the .md code of a shield badge with the status of your application.
| add-git-tag    |         | Adds a tag with the version number to the git repo.
| init    |           |   Generates the appversion.json file.|

When using the *update* command, use `major|minor|patch` or `breaking|feature|fix` is the same, is a question of making **more expressive** the command and what are you doing.

Some usage examples:   
```
$ apv update minor
$ apv set-version 1.3.2
$ apv set-status rc.2
```
If you want to add a *Git tag* to your repo with the version number of your code, you have two options:  
1) Add the `--tag` flag after `update` and `set-version` commands
```
$ apv update minor --tag
$ apv set-version 1.3.2 --tag
```
2) Use `add-git-tag`
```
$ apv add-git-tag  
```

By default, AppVersion updates the *"version"* field in `package.json`; if you want to update the *"version"* field in more json files, just add the file name inside *appversion.json* in the json array field.

AppVersion looks recursively inside all the subfolders of your project for json files, by default it ignores `node_modules`, `bower_components` and `.git` folders; if you want to ignore more folders just add the folder name inside *appversion.json* in the ignore array field.  
If you want that AppVersion *ignores all the subfolders* in your project, just put `"*"` inside the ignore array.

<a name="generateBadge"></a>
AppVersion can provide you a wonderful shield badge with the version of your application that you can put in you .md file, like what you see at the top of this file.  
Generate the badge is very easy, just type ```apv generate-badge version``` for the version badge and ```apv generate-badge status``` for the status badge and copy the output inside your .md file, then add the name of the md file (with the extension) inside the markdown array field in *appversion.json*, from now AppVersion will keep updated the badges every time you update your application.  
*Badge examples:*  
![AppVersion-version](https://img.shields.io/badge/AppVersion-2.4.1-brightgreen.svg?style=flat) ![AppVersion-status](https://img.shields.io/badge/Status-Beta.4-brightgreen.svg?style=flat)  
This feature make use of the amazing service [shields.io](http://shields.io/).

### In app:

| APIs                                               |       |
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
|:------------|:-----------------|
| **M \ B**   | version.major    |
| **m \ F**   | version.minor    |
| **p \ f**   | version.patch    |
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
<a name="automation"></a>
## Automation
If you are using *npm scripts* you can easily integrate AppVersion in your workflow, below you can find an example of a package.json:
```json
...
"scripts": {
  "build": "<build command> && apv update build"
},
...
```
If you are using Grunt or Gulp for automating your project, you can easily use AppVersion inside you grunt/gulp file.
Just require **appversion/automation** and call the `update|setVersion|setStatus` methods with the correct parameter.  
Below you can find an example:
```javascript
const apv = require('appversion/automation')
...
apv.update('minor')
...
apv.setVersion('1.4.2')
...
apv.setStatus('Beta.2')
...

```
## TODO
- [x] Update status number
- [x] Badge generator with the application version for the README.md.
- [x] Move `json`, `markdown`, `ignore` and `appversion` inside `config` field
- [x] Implement "New version" message
- [x] Split the code in multiple files divided by function.
- [x] Integration with GitHub
- [x] When init is called, apv must create appversion.json with the same version number of package.json.
- [x] Integration with Grunt/Gulp
- [x] Add aliases: patch>fix, minor>feature major>breaking
- [x] Rewrite appendBadgeToMD with streams
- [ ] SHA generator

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
The code is released under the MIT license.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
