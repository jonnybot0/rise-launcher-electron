package com.risevision.javanetworktest;

import com.github.kevinsawicki.http.HttpRequest;
import java.net.URL;

class MockHttpRequest extends HttpRequest {
  int code;

  MockHttpRequest(int code) throws Exception {
    super(new URL("http://no.matter"), "get");
    this.code = code;
  }

  @Override
  public int code() {
    return code;
  }
}
