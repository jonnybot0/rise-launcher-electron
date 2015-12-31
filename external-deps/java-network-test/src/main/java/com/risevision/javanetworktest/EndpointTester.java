package com.risevision.javanetworktest;

import java.lang.reflect.*;
import java.net.URL;
import com.github.kevinsawicki.http.HttpRequest;

class EndpointTester {
  Method get;

  EndpointTester(Class networkServiceClass) {
    try {
    this.get = networkServiceClass.getDeclaredMethod("get", URL.class);
    } catch (Exception e) {
      System.out.println(e);
      System.exit(99);
    }
  }

  int testEndpoints(String[] urls) {
    int retCode = 0;

    try {
      for (int i = 0; i < urls.length; i++) {
        HttpRequest req = (HttpRequest)get.invoke(null, new URL(urls[i]));
        int code = req.code();
        System.out.println(code + " - " + urls[i]);
        if (code < 199 || code > 299) {
          retCode = 500;
        }
      }
    } catch (Exception e) {
      System.out.println(e);
      System.out.println(e.getCause());
      return 1;
    }

    return retCode;
  };
}
