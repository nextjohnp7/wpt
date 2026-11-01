// META: title=Cookie Store API: cookieStore.getAll() arguments
// META: global=window,serviceworker

'use strict';

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  await cookieStore.set('cookie-name-2', 'cookie-value-2');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name-2');
  });

  const cookies = await cookieStore.getAll();
  cookies.sort((a, b) => a.name.localeCompare(b.name));
  assert_equals(cookies.length, 2);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
  assert_equals(cookies[1].name, 'cookie-name-2');
  assert_equals(cookies[1].value, 'cookie-value-2');
}, 'cookieStore.getAll with no arguments');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  await cookieStore.set('cookie-name-2', 'cookie-value-2');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name-2');
  });

  const cookies = await cookieStore.getAll({});
  cookies.sort((a, b) => a.name.localeCompare(b.name));
  assert_equals(cookies.length, 2);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
  assert_equals(cookies[1].name, 'cookie-name-2');
  assert_equals(cookies[1].value, 'cookie-value-2');
}, 'cookieStore.getAll with empty options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  await cookieStore.set('cookie-name-2', 'cookie-value-2');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name-2');
  });

  const cookies = await cookieStore.getAll('cookie-name');
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with positional name');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  await cookieStore.set('cookie-name-2', 'cookie-value-2');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name-2');
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-name' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with name in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  await cookieStore.set('cookie-name-2', 'cookie-value-2');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name-2');
  });

  const cookies = await cookieStore.getAll('cookie-name',
                                           { name: 'wrong-cookie-name' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with name in both positional arguments and options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  let target_url = self.location.href;
  if (self.GLOBAL.isWorker()) {
    target_url = target_url + '/path/within/scope';
  }

  const cookies = await cookieStore.getAll({ url: target_url });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with absolute url in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  let target_path = self.location.pathname;
  if (self.GLOBAL.isWorker()) {
    target_path = target_path + '/path/within/scope';
  }

  const cookies = await cookieStore.getAll({ url: target_path });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with relative url in options');

if (!self.GLOBAL.isWorker()) {
  promise_test(async testCase => {
    const invalid_url =
        `${self.location.protocol}//${self.location.host}/different/path`;
    await promise_rejects_js(testCase, TypeError, cookieStore.getAll(
        { url: invalid_url }));
  }, 'cookieStore.getAll with invalid url path in options');
} else {
  promise_test(async testCase => {
    await cookieStore.set('cookie-name', 'cookie-value');
    testCase.add_cleanup(async () => {
      await cookieStore.delete('cookie-name');
    });

    const sameorigin_url =
        `${self.location.protocol}//${self.location.host}/different/path`;
    const cookies = await cookieStore.getAll({ url: sameorigin_url });
    assert_equals(cookies.length, 1);
    assert_equals(cookies[0].name, 'cookie-name');
    assert_equals(cookies[0].value, 'cookie-value');
  }, 'cookieStore.getAll with same-origin url path in options');
}

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });

  const invalid_url =
      `${self.location.protocol}//www.example.com${self.location.pathname}`;
  await promise_rejects_js(testCase, TypeError, cookieStore.getAll(
      { url: invalid_url }));
}, 'cookieStore.getAll with invalid url host in options');

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

  const cookies = await cookieStore.getAll({ url: target_url });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with absolute url with fragment in options');

promise_test(async testCase => {
  if (!self.GLOBAL.isWorker()) {
    await cookieStore.set('cookie-name', 'cookie-value');
    testCase.add_cleanup(async () => {
      await cookieStore.delete('cookie-name');
    });

    self.location = "#foo";
    let target_url = self.location.href;

    const cookies = await cookieStore.getAll({ url: target_url });
    assert_equals(cookies.length, 1);
    assert_equals(cookies[0].name, 'cookie-name');
    assert_equals(cookies[0].value, 'cookie-value');
  }
}, 'cookieStore.getAll with absolute different url in options');

promise_test(async testCase => {
  await cookieStore.set('cookie-name', 'cookie-value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-name');
  });
  const cookies = await cookieStore.getAll(' cookie-name \t');
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-name');
  assert_equals(cookies[0].value, 'cookie-value');
}, 'cookieStore.getAll with whitespace');

// 1. Partitioned Cookies getAll
promise_test(async testCase => {
  await cookieStore.set('cookie-partitioned', 'value', { partitioned: true });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-partitioned', { partitioned: true });
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-partitioned', partitioned: true });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-partitioned');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with partitioned cookie');

// 2. SameSite Attribute getAll
promise_test(async testCase => {
  // SameSite=Strict
  await cookieStore.set('cookie-samesite-strict', 'value', { sameSite: 'strict' });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-samesite-strict');
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-samesite-strict' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-samesite-strict');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with SameSite=Strict cookie');

promise_test(async testCase => {
  // SameSite=Lax
  await cookieStore.set('cookie-samesite-lax', 'value', { sameSite: 'lax' });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-samesite-lax');
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-samesite-lax' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-samesite-lax');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with SameSite=Lax cookie');

promise_test(async testCase => {
  // SameSite=None requires Secure
  await cookieStore.set('cookie-samesite-none', 'value', { sameSite: 'none', secure: true });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-samesite-none');
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-samesite-none' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-samesite-none');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with SameSite=None; Secure cookie');

// 3. Secure Attribute getAll
promise_test(async testCase => {
  // Secure cookie
  await cookieStore.set('cookie-secure', 'value', { secure: true });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-secure');
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-secure' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-secure');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with Secure cookie');

promise_test(async testCase => {
  // Non-secure cookie
  await cookieStore.set('cookie-nonsecure', 'value');
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-nonsecure');
  });

  const cookies = await cookieStore.getAll({ name: 'cookie-nonsecure' });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-nonsecure');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with non-secure cookie');

// 4. getAll with non-existent name
promise_test(async testCase => {
  const cookies = await cookieStore.getAll({ name: 'cookie-nonexistent' });
  assert_equals(cookies.length, 0);
}, 'cookieStore.getAll with non-existent name returns empty array');

// 5. getAll with path filtering
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
  const cookies = await cookieStore.getAll({ name: 'cookie-path-match', path: currentDirectory });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-path-match');
  assert_equals(cookies[0].value, 'value');

  // Get cookie with non-matching path - should return empty
  const noCookies = await cookieStore.getAll({ name: 'cookie-path-match', path: currentDirectory + 'other/' });
  assert_equals(noCookies.length, 0);
}, 'cookieStore.getAll with path filtering');

// 6. getAll with domain filtering
promise_test(async testCase => {
  const currentUrl = new URL(self.location.href);
  const currentDomain = currentUrl.hostname;

  await cookieStore.set('cookie-domain-match', 'value', { domain: currentDomain });
  testCase.add_cleanup(async () => {
    await cookieStore.delete('cookie-domain-match', { domain: currentDomain });
  });

  // Get cookie with matching domain
  const cookies = await cookieStore.getAll({ name: 'cookie-domain-match', domain: currentDomain });
  assert_equals(cookies.length, 1);
  assert_equals(cookies[0].name, 'cookie-domain-match');
  assert_equals(cookies[0].value, 'value');
}, 'cookieStore.getAll with domain filtering');
