package com.risevision.javanetworktest;

import java.util.*;
import java.net.URL;

class MockNetworkService {
  static List<URL> calls = new ArrayList<>();

  static MockHttpRequest get(URL url) {
    calls.add(url);
    try {
      if (url.getHost().equals("forcefail.com")) {return new MockHttpRequest(400);}
      return new MockHttpRequest(200);
    } catch (Exception e) {
      System.out.println(e);
      System.out.println(e.getCause());
      return null;
    }
  }

}
