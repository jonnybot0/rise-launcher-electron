package com.risevision.javanetworktest;

import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;
import java.util.*;

public class EndpointTesterTest {
  @Test
  public void itCallsEndpoints() {
    EndpointTester tester = new EndpointTester(MockNetworkService.class);
    String[] endpoints = new String[]{
      "http://test1.com",
      "http://test2.com"
    };

    int retCode = tester.testEndpoints(endpoints);
    assertThat(MockNetworkService.calls.size(), is(2));
    assertThat(MockNetworkService.calls.get(0).getHost(), is("test1.com"));
    assertThat(MockNetworkService.calls.get(1).getHost(), is("test2.com"));
    assertThat(retCode, is(0));
  }

  @Test
  public void itReturnsFailureOnBadReturnCode() {
    EndpointTester tester = new EndpointTester(MockNetworkService.class);
    String[] endpoints = new String[]{
      "http://forcefail.com",
      "http://test2.com"
    };
    assertThat(tester.testEndpoints(endpoints), is(500));
  }
}
