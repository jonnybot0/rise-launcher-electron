var platform = require("../../../common/platform.js"),
childProcess = require("child_process"),
os = require("os"),
path = require("path"),
fs = require("fs"),
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("platform", ()=>{
  beforeEach("setup mocks", ()=>{
    
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("gets Ubuntu version", ()=>{
    mock(childProcess, "spawnSync").returnWith({ stdout: {} });

    platform.getUbuntuVer();

    assert(childProcess.spawnSync.called);
    assert.equal(childProcess.spawnSync.lastCall.args[0], "lsb_release");
    assert.equal(childProcess.spawnSync.lastCall.args[1][0], "-sr");
  });

  it("gets temporary directory", ()=>{
    mock(os, "tmpdir").returnWith("temp");

    platform.getTempDir();

    assert(os.tmpdir.called);
  });

  it("waits for 100ms to resolve the promise", ()=>{
    var time0 = new Date().getTime();

    return platform.waitFor(100).then(()=>{
      assert(new Date().getTime() - time0 >= 0);
    });
  });

  it("starts a detached child process", ()=>{
    mock(childProcess, "spawn").returnWith({ unref() {} });

    platform.startProcess("ls", ["-a", "*"]);

    assert(childProcess.spawn.called);
    assert.equal(childProcess.spawn.lastCall.args[0], "ls");
    assert.equal(childProcess.spawn.lastCall.args[2].detached, true);
  });

  it("reads a text file", ()=>{
    mock(fs, "readFile").callbackWith(null, "text");

    return platform.readTextFile("file.txt").then((content)=>{
      assert(fs.readFile.called);
      assert.equal(content, "text");
    });
  });

  it("fails to read a text file", ()=>{
    mock(fs, "readFile").callbackWith("read error", null);

    return platform.readTextFile("file.txt").catch((err)=>{
      assert(fs.readFile.called);
      assert.equal(err.error, "read error");
    });
  });

  it("synchronously reads a text file", ()=>{
    mock(fs, "readFileSync").returnWith("text");

    assert.equal(platform.readTextFileSync("file.txt"), "text");
    assert(fs.readFileSync.called);
  });

  it("fails to synchronously reads a text file", ()=>{
    mock(fs, "readFileSync").throwWith("error");

    assert.equal(platform.readTextFileSync("file.txt"), "");
    assert(fs.readFileSync.called);
  });

  it("writes a text file", ()=>{
    mock(fs, "writeFile").callbackWith(null);

    return platform.writeTextFile("file.txt", "text").then(()=>{
      assert(fs.writeFile.called);
    });
  });

  it("fails to write a text file", ()=>{
    mock(fs, "writeFile").callbackWith("write error");

    return platform.writeTextFile("file.txt", "text").catch((err)=>{
      assert(fs.writeFile.called);
      assert.equal(err.error, "write error");
    });
  });

  it("copies folder recursively", ()=>{
    mock(platform, "callNCP").callbackWith(null);

    return platform.copyFolderRecursive("folder1", "folder2").then((err)=>{
      assert(platform.callNCP.called);
      assert(!err);
    });
  });

  it("fails to copy folder recursively", ()=>{
    mock(platform, "callNCP").callbackWith("error");

    return platform.copyFolderRecursive("folder1", "folder2").catch((err)=>{
      assert(platform.callNCP.called);
      assert.equal(err, "error");
    });
  });

  it("sets file permissions", ()=>{
    mock(fs, "chmod").callbackWith(null);

    return platform.setFilePermissions("file.txt", 0755).then(()=>{
      assert(fs.chmod.called);
    });
  });

  it("fails to write a text file", ()=>{
    mock(fs, "chmod").callbackWith("chmod error");

    return platform.setFilePermissions("file.txt", "text").catch((err)=>{
      assert(fs.chmod.called);
      assert.equal(err.error, "chmod error");
    });
  });

  it("checks if file exists", ()=>{
    mock(fs, "lstatSync").returnWith();

    assert(platform.fileExists("file.txt"));
    assert(fs.lstatSync.called);
  });

  it("fails to write a text file", ()=>{
    mock(fs, "lstatSync").throwWith("lstatSync error");

    assert(!platform.fileExists("file.txt"));
    assert(fs.lstatSync.called);
  });

  it("creates a non-existing directory", ()=>{
    mock(fs, "mkdirSync").returnWith();

    return platform.mkdir("newDir").then(()=>{
      assert(fs.mkdirSync.called);
    });
  });

  it("tries to create an existing directory, but does not fail", ()=>{
    mock(fs, "mkdirSync").throwWith({ code: "EEXIST" });

    return platform.mkdir("newDir").then(()=>{
      assert(fs.mkdirSync.called);
    });
  });

  it("fails tries to create a directory", ()=>{
    mock(fs, "mkdirSync").throwWith({ code: "ERROR" });

    return platform.mkdir("newDir").catch(()=>{
      assert(fs.mkdirSync.called);
    });
  });

  it("renames a file", ()=>{
    mock(fs, "rename").callbackWith(null);

    return platform.renameFile("file.txt", "newname.txt").then(()=>{
      assert(fs.rename.called);
    });
  });

  it("fails to rename a file", ()=>{
    mock(fs, "rename").callbackWith("rename error");

    return platform.renameFile("file.txt", "newname.txt").catch((err)=>{
      assert(fs.rename.called);
      assert.equal(err.error, "rename error");
    });
  });
});
