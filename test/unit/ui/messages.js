'use strict';

let assert = require('assert');

let messages = global.messages;

describe ('messages', ()=>{
  it('should load messages at the global level', ()=>{
    assert(typeof messages === 'object');
  });

  it('should read the messages as strings', ()=>{
    Object.keys(messages).forEach((key)=>{
      assert(typeof messages[key] === 'string');
    });
  });

  it('should find more than zero messages', ()=>{
    let messageCount = 0;
    Object.keys(messages).forEach((key)=>{
      messageCount += 1;
    });
    assert(messageCount > 0);
  });

  it('should render links with target="_blank"', ()=>{
    console.log(messages.genericSuggestion);
    assert(messages.genericSuggestion.indexOf(' target="_blank"') > -1);
  });
});
