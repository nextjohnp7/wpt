// META: title=Cookie Store API: cookieStore.get() arguments
// META: global=window,serviceworker

'use strict';

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  await promise_rejects_js(testCase, TypeError, cookieStore.get());
}, 'cookieStore.get with no arguments returns TypeError');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  await promise_rejects_js(testCase, TypeError, cookieStore.get({}));
},'cookieStore.get with empty options returns TypeError');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  const cookie = await cookieStore.get('cookie-name');
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with positional name');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  const cookie = await cookieStore.get({ name: 'cookie-name' });
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with name in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  const cookie = await cookieStore.get('cookie-name',
                                       { name: 'wrong-cookie-name' });
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with name in both positional arguments and options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  let target_url = self.location.href;
  if (self.GLOBAL.isWorker()) {
    target_url = target_url + '/path/within/scope';
  }

  const cookie = await cookieStore.get({ url: target_url });
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with absolute url in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  let target_path = self.location.pathname;
  if (self.GLOBAL.isWorker()) {
    target_path = target_path + '/path/within/scope';
  }

  const cookie = await cookieStore.get({ url: target_path });
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with relative url in options');

if (!self.GLOBAL.isWorker()) {
  promise_test(async testCase => {
    const invalid_url =
        `${self.location.protocol}//${self.location.host}/different/path`;
    await promise_rejects_js(testCase, TypeError, cookieStore.get(
        { url: invalid_url }));
  }, 'cookieStore.get with invalid url path in options');
} else {
  promise_test(async testCase => {
    const sameorigin_url =
        `${self.location.protocol}//${self.location.host}/different/path`;
    assert_true(await cookieStore.get({ url: sameorigin_url }) === null);
  }, 'cookieStore.get with same-origin url path in options');
}

promise_test(async testCase => {
  const invalid_url =
      `${self.location.protocol}//www.example.com${self.location.pathname}`;
  await promise_rejects_js(testCase, TypeError, cookieStore.get(
      { url: invalid_url }));
}, 'cookieStore.get with invalid url host in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  let target_url = self.location.href;
  if (self.GLOBAL.isWorker()) {
    target_url = target_url + '/path/within/scope';
  }

  target_url = target_url + "#foo";

  const cookie = await cookieStore.get({ url: target_url });
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with absolute url with fragment in options');

promise_test(async testCase => {
  if (!self.GLOBAL.isWorker()) {
    await cookieStore.set('cookie-name', 'cookie-value');
    testCase.add_cleanup(async () => {
      await cookieStore.delete('cookie-name');
    });

    self.location = "#foo";
    let target_url = self.location.href;

    const cookie = await cookieStore.get({ url: target_url });
    assert_equals(cookie.name, 'cookie-name');
    assert_equals(cookie.value, 'cookie-value');
  }
}, 'cookieStore.get with absolute different url in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  const cookie = await cookieStore.get(' cookie-name \t');
  assert_equals(cookie.name, 'cookie-name');
  assert_equals(cookie.value, 'cookie-value');
}, 'cookieStore.get with whitespace');

// 1. Partitioned Cookies get
promise_test(async testCase => {
  await cookieStore.set('cookie-partitioned', 'value', { partitioned: true });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-partitioned', { partitioned: true });
  });

  const cookie = await cookieStore.get('cookie-partitioned', { partitioned: true });
  assert_equals(cookie.name, 'cookie-partitioned');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with partitioned cookie');

// 2. SameSite Attribute get
promise_test(async testCase => {
  // SameSite=Strict
  await cookieStore.set('cookie-samesite-strict', 'value', { sameSite: 'strict' });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-samesite-strict');
  });

  const cookie = await cookieStore.get({ name: 'cookie-samesite-strict' });
  assert_equals(cookie.name, 'cookie-samesite-strict');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with SameSite=Strict cookie');

promise_test(async testCase => {
  // SameSite=Lax
  await cookieStore.set('cookie-samesite-lax', 'value', { sameSite: 'lax' });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-samesite-lax');
  });

  const cookie = await cookieStore.get({ name: 'cookie-samesite-lax' });
  assert_equals(cookie.name, 'cookie-samesite-lax');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with SameSite=Lax cookie');

promise_test(async testCase => {
  // SameSite=None requires Secure
  await cookieStore.set('cookie-samesite-none', 'value', { sameSite: 'none', secure: true });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-samesite-none');
  });

  const cookie = await cookieStore.get({ name: 'cookie-samesite-none' });
  assert_equals(cookie.name, 'cookie-samesite-none');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with SameSite=None; Secure cookie');

// 3. Secure Attribute get
promise_test(async testCase => {
  // Secure cookie
  await cookieStore.set('cookie-secure', 'value', { secure: true });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-secure');
  });

  const cookie = await cookieStore.get({ name: 'cookie-secure' });
  assert_equals(cookie.name, 'cookie-secure');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with Secure cookie');

promise_test(async testCase => {
  // Non-secure cookie
  await cookieStore.set('cookie-nonsecure', 'value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-nonsecure');
  });

  const cookie = await cookieStore.get({ name: 'cookie-nonsecure' });
  assert_equals(cookie.name, 'cookie-nonsecure');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with non-secure cookie');

// 4. get with non-existent name
promise_test(async testCase => {
  const cookie = await cookieStore.get({ name: 'cookie-nonexistent' });
  assert_equals(cookie, null);
}, 'cookieStore.get with non-existent name returns null');

// 5. get with path filtering
promise_test(async testCase => {
  const currentUrl = new URL(self.location.href);
  const currentPath = currentUrl.pathname;
  const currentDirectory =
      currentPath.substr(0, currentPath.lastIndexOf('/') + 1);

  await cookieStore.set('cookie-path-match', 'value', { path: currentDirectory });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-path-match', { path: currentDirectory });
  });

  // Get cookie with matching path
  const cookie = await cookieStore.get({ name: 'cookie-path-match', path: currentDirectory });
  assert_equals(cookie.name, 'cookie-path-match');
  assert_equals(cookie.value, 'value');

  // Get cookie with non-matching path - should return null
  const noCookie = await cookieStore.get({ name: 'cookie-path-match', path: currentDirectory + 'other/' });
  assert_equals(noCookie, null);
}, 'cookieStore.get with path filtering');

// 6. get with domain filtering
promise_test(async testCase => {
  const currentUrl = new URL(self.location.href);
  const currentDomain = currentUrl.hostname;

  await cookieStore.set('cookie-domain-match', 'value', { domain: currentDomain });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-domain-match', { domain: currentDomain });
  });

  // Get cookie with matching domain
  const cookie = await cookieStore.get({ name: 'cookie-domain-match', domain: currentDomain });
  assert_equals(cookie.name, 'cookie-domain-match');
  assert_equals(cookie.value, 'value');
}, 'cookieStore.get with domain filtering');
