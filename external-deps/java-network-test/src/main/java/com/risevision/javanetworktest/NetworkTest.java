package com.risevision.javanetworktest;

import com.github.kevinsawicki.http.HttpRequest;

public class NetworkTest {
  public static void main(String[] args) {
    EndpointTester tester = new EndpointTester(HttpRequest.class);
    System.exit(tester.testEndpoints(args));
  }
}
