// META: title=Cookie Store API: cookieStore.subscribe() arguments
// META: global=window,serviceworker
// META: script=/service-workers/service-worker/resources/test-helpers.sub.js

'use strict';

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await wait_for_state(testCase, registration.installing, 'activated');

    self.registration = registration;
  } else if (!self.registration.active) {
    // If service worker is not active yet, it must wait for it to enter the
    // 'activated' state before subscribing to cookiechange events.
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  let subscriptions =
      [{name: 'cookie-name'}, {url: self.registration.scope + '/subdir'}];
  await self.registration.cookies.subscribe(subscriptions);
  testCase.add_cleanup(
      () => self.registration.cookies.unsubscribe(subscriptions));

  subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 2);
  assert_equals(subscriptions[0].name, 'cookie-name');
  assert_equals(subscriptions[0].url, self.registration.scope);
  assert_equals(subscriptions[1].name, undefined)
  assert_equals(subscriptions[1].url, self.registration.scope + '/subdir')
}, 'cookieStore.subscribe without name or url in options');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');

    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await wait_for_state(testCase, registration.installing, 'activated');
    testCase.add_cleanup(() => self.registration.unregister());

    self.registration = registration;
  } else if (!self.registration.active) {
    // If service worker is not active yet, it must wait for it to enter the
    // 'activated' state before subscribing to cookiechange events.
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  let subscriptions = [{}];
  await self.registration.cookies.subscribe(subscriptions);
  testCase.add_cleanup(
      () => self.registration.cookies.unsubscribe(subscriptions));

  subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, undefined);
  assert_equals(subscriptions[0].url, self.registration.scope);
}, 'cookieStore.subscribe with empty option');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await wait_for_state(testCase, registration.installing, 'activated');

    self.registration = registration;
  } else if (!self.registration.active) {
    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  await promise_rejects_js(
      testCase, TypeError,
      registration.cookies.subscribe(
          {name: 'cookie-name', url: '/wrong/path'}));
}, 'cookieStore.subscribe with invalid url path in option');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await wait_for_state(testCase, registration.installing, 'activated');

    self.registration = registration;
  } else if (!self.registration.active) {
    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  let subscriptions = [{name: 'cookie-name'}];
  // Call subscribe for same subscription multiple times to verify that it is
  // idempotent.
  await self.registration.cookies.subscribe(subscriptions);
  await self.registration.cookies.subscribe(subscriptions);
  await self.registration.cookies.subscribe(subscriptions);
  testCase.add_cleanup(() => registration.cookies.unsubscribe(subscriptions));

  subscriptions = await registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-name');
  assert_equals(subscriptions[0].url, registration.scope);
}, 'cookieStore.subscribe is idempotent');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await wait_for_state(testCase, registration.installing, 'activated');

    self.registration = registration;
  } else if (!self.registration.active) {
    // Must wait for the service worker to enter the 'activated' state before
    // subscribing to cookiechange events.
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  let subscriptions = [
    {name: 'cookie-name1'},
    {name: 'cookie-name2'},
  ];
  await self.registration.cookies.subscribe(subscriptions);
  testCase.add_cleanup(() => registration.cookies.unsubscribe(subscriptions));

  // Call unsubscribe for same subscription multiple times to verify that it
  // is idempotent.
  await registration.cookies.unsubscribe([subscriptions[0]]);
  await registration.cookies.unsubscribe([subscriptions[0]]);
  await registration.cookies.unsubscribe([subscriptions[0]]);

  subscriptions = await registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-name2');
  assert_equals(subscriptions[0].url, registration.scope);
}, 'CookieStore.unsubscribe is idempotent');

// 1. Partitioned Cookies subscribe
promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  await self.registration.cookies.subscribe(
      [{name: 'cookie-partitioned', partitioned: true}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe(
        [{name: 'cookie-partitioned', partitioned: true}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-partitioned');
  assert_equals(subscriptions[0].partitioned, true);
}, 'cookieStore.subscribe with partitioned cookie');

// 2. SameSite Attribute subscribe
promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  // SameSite=Strict
  await self.registration.cookies.subscribe(
      [{name: 'cookie-samesite-strict', sameSite: 'strict'}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe(
        [{name: 'cookie-samesite-strict', sameSite: 'strict'}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-samesite-strict');
  assert_equals(subscriptions[0].sameSite, 'strict');
}, 'cookieStore.subscribe with SameSite=Strict cookie');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  // SameSite=Lax
  await self.registration.cookies.subscribe(
      [{name: 'cookie-samesite-lax', sameSite: 'lax'}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe(
        [{name: 'cookie-samesite-lax', sameSite: 'lax'}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-samesite-lax');
  assert_equals(subscriptions[0].sameSite, 'lax');
}, 'cookieStore.subscribe with SameSite=Lax cookie');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  // SameSite=None requires Secure
  await self.registration.cookies.subscribe(
      [{name: 'cookie-samesite-none', sameSite: 'none', secure: true}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe(
        [{name: 'cookie-samesite-none', sameSite: 'none', secure: true}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-samesite-none');
  assert_equals(subscriptions[0].sameSite, 'none');
  assert_equals(subscriptions[0].secure, true);
}, 'cookieStore.subscribe with SameSite=None; Secure cookie');

// 3. Secure Attribute subscribe
promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  // Secure cookie
  await self.registration.cookies.subscribe(
      [{name: 'cookie-secure', secure: true}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe([{name: 'cookie-secure', secure: true}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-secure');
  assert_equals(subscriptions[0].secure, true);
}, 'cookieStore.subscribe with Secure cookie');

promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  // Non-secure cookie
  await self.registration.cookies.subscribe([{name: 'cookie-nonsecure'}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe([{name: 'cookie-nonsecure'}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-nonsecure');
  assert_equals(subscriptions[0].secure, undefined);
}, 'cookieStore.subscribe with non-secure cookie');

// 4. Subscribe with non-existent name
promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  // Subscribe to non-existent cookie name - should not throw
  await self.registration.cookies.subscribe([{name: 'cookie-nonexistent'}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe([{name: 'cookie-nonexistent'}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-nonexistent');
}, 'cookieStore.subscribe with non-existent name should not throw');

// 5. Subscribe with path filtering
promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  const currentPath = self.registration.scope;
  const subPath = currentPath + 'subdir/';

  await self.registration.cookies.subscribe(
      [{name: 'cookie-path-match', path: currentPath}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe(
        [{name: 'cookie-path-match', path: currentPath}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-path-match');
  assert_equals(subscriptions[0].path, currentPath);
}, 'cookieStore.subscribe with path filtering');

// 6. Subscribe with domain filtering
promise_test(async testCase => {
  if (self.GLOBAL.isWindow()) {
    const registration = await service_worker_unregister_and_register(
        testCase, 'resources/empty_sw.js',
        '/cookiestore/resources/does/not/exist');
    testCase.add_cleanup(() => registration.unregister());

    await wait_for_state(testCase, registration.installing, 'activated');
    self.registration = registration;
  } else if (!self.registration.active) {
    await new Promise(resolve => self.addEventListener('activate', resolve));
  }

  const currentUrl = new URL(self.location.href);
  const currentDomain = currentUrl.hostname;

  await self.registration.cookies.subscribe(
      [{name: 'cookie-domain-match', domain: currentDomain}]);
  testCase.add_cleanup(() => {
    self.registration.cookies.unsubscribe(
        [{name: 'cookie-domain-match', domain: currentDomain}]);
  });

  const subscriptions = await self.registration.cookies.getSubscriptions();
  assert_equals(subscriptions.length, 1);
  assert_equals(subscriptions[0].name, 'cookie-domain-match');
  assert_equals(subscriptions[0].domain, currentDomain);
}, 'cookieStore.subscribe with domain filtering');
