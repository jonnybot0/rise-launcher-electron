var log,
uiWindow,
externalLogger,
assert = require("assert"),
simpleMock = require("simple-mock"),
mock = require("simple-mock").mock;

describe("launcher", ()=>{
  beforeEach("setup mocks", ()=>{
    uiWindow = {};
    externalLogger = {};

    mock(uiWindow, "send").returnWith();
    mock(externalLogger, "log").returnWith();

    log = require("../../logger/logger.js")(externalLogger);
  });

  afterEach("clean mocks", ()=>{
    simpleMock.restore();
  });

  it("properly calls registered loggers on 'error' method", ()=>{
    log.setUIWindow(uiWindow);
    log.error("test");
    assert(uiWindow.send.called);
    assert(externalLogger.log.called);
  });

  it("properly calls registered loggers on 'all' method", ()=>{
    log.setUIWindow(uiWindow);
    log.all("test");
    assert(uiWindow.send.called);
    assert(externalLogger.log.called);
  });

  it("only calls external logger on 'external' method", ()=>{
    log.setUIWindow(uiWindow);
    log.external("test");
    assert(!uiWindow.send.called);
    assert(externalLogger.log.called);
  });

  it("sets external logger's display settings", ()=>{
    mock(externalLogger, "setDisplaySettings").returnWith();
    log.setDisplaySettings("test");
    assert(externalLogger.setDisplaySettings.called);
  });
});
