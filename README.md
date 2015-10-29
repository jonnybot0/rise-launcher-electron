# Rise Installer (Electron)

### Run it
```
npm install
./node_modules/.bin/electron .
```

### Test
```
npm install -g istanbul mocha
npm run test
```

### Build it
```
node build.js
```

### Run from build
```
builds/installer-linux-x64/installer
```

### Notes on forked dependencies

Electron patches Node.js "fs" module to provide support for a custom packaged file format called "asar". This patched module causes issues on libraries which rely on standard "fs" when an .asar file is found. For this reason, both adm-zip and ncp were cloned and modified to use original-fs when running on Electron.
