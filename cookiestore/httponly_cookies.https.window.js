// META: script=resources/cookie-test-helpers.js

'use strict';

promise_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringHttp('HTTPONLY-cookie=value; path=/; httponly');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-cookie=DELETED; path=/; httponly; Max-Age=0`);
  });
  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie we wrote using HTTP in cookie jar' +
        ' is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-cookie=value',
    'HttpOnly cookie we wrote using HTTP in HTTP cookie jar');

  await setCookieStringHttp('HTTPONLY-cookie=new-value; path=/; httponly');
  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie we overwrote using HTTP in cookie jar' +
        ' is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-cookie=new-value',
    'HttpOnly cookie we overwrote using HTTP in HTTP cookie jar');

  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringHttp(
      'HTTPONLY-cookie=DELETED; path=/; max-age=0; httponly');
  assert_equals(
      await getCookieString(),
      undefined,
      'Empty cookie jar after HTTP cookie-clearing using max-age=0');
  assert_equals(
      await getCookieStringHttp(),
      undefined,
      'Empty HTTP cookie jar after HTTP cookie-clearing using max-age=0');

  // HTTPONLY cookie changes should not have been observed; perform
  // a dummy change to verify that nothing else was queued up.
  await cookieStore.set('TEST', 'dummy');
  t.add_cleanup(async () => {
    await cookieStore.delete('TEST');
  });
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'TEST', value: 'dummy'}]},
    'HttpOnly cookie deletion was not observed');
}, 'HttpOnly cookies are not observed');


cookie_test(async t => {
  document.cookie = 'cookie1=value1; path=/';
  document.cookie = 'cookie2=value2; path=/; httponly';
  document.cookie = 'cookie3=value3; path=/';
  assert_equals(
    await getCookieStringHttp(), 'cookie1=value1; cookie3=value3',
    'Trying to store an HttpOnly cookie with document.cookie fails');
}, 'HttpOnly cookies can not be set by document.cookie');


// Historical: Early iterations of the proposal included an httpOnly option.
cookie_test(async t => {
  await cookieStore.set('cookie1', 'value1');
  await cookieStore.set('cookie2', 'value2', {httpOnly: true});
  await cookieStore.set('cookie3', 'value3');
  assert_equals(
    await getCookieStringHttp(),
    'cookie1=value1; cookie2=value2; cookie3=value3',
    'httpOnly is not an option for CookieStore.set()');
}, 'HttpOnly cookies can not be set by CookieStore');

promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-cookie=value; path=/; httponly');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-cookie=DELETED; path=/; httponly; Max-Age=0`);
  });
  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie we wrote using HTTP in cookie jar' +
        ' is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-cookie=value',
    'HttpOnly cookie we wrote using HTTP in HTTP cookie jar');

  try {
    await cookieStore.set('HTTPONLY-cookie', 'dummy');
  } catch(e) {}

  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie is not overwritten');

  try {
    await cookieStore.delete('HTTPONLY-cookie');
  } catch(e) {}

  assert_equals(await getCookieString(), undefined, 'HttpOnly cookie is not overwritten');

  assert_equals(await getCookieStringHttp(), 'HTTPONLY-cookie=value', 'HttpOnly cookie is not deleted');
}, 'HttpOnly cookies are not deleted/overwritten');

// Additional test: HttpOnly cookie should not appear in getAll()
promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-cookie=value; path=/; httponly');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-cookie=DELETED; path=/; httponly; Max-Age=0`);
  });
  await cookieStore.set('visible-cookie', 'visible-value');
  t.add_cleanup(async () => {
    await cookieStore.delete('visible-cookie');
  });

  const cookies = await cookieStore.getAll();
  const cookieNames = cookies.map(c => c.name);
  assert_false(cookieNames.includes('HTTPONLY-cookie'),
    'HttpOnly cookie should not appear in getAll()');
  assert_true(cookieNames.includes('visible-cookie'),
    'Visible cookie should appear in getAll()');
}, 'HttpOnly cookie should not appear in getAll()');

// Additional test: HttpOnly cookie with SameSite attribute
promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-samesite=value; path=/; httponly; SameSite=Strict');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-samesite=DELETED; path=/; httponly; SameSite=Strict; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie with SameSite=Strict is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-samesite=value',
    'HttpOnly cookie with SameSite=Strict is visible via HTTP');
}, 'HttpOnly cookie with SameSite=Strict attribute');

// Additional test: HttpOnly cookie with Secure attribute
promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-secure=value; path=/; httponly; Secure');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-secure=DELETED; path=/; httponly; Secure; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie with Secure is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-secure=value',
    'HttpOnly cookie with Secure is visible via HTTP');
}, 'HttpOnly cookie with Secure attribute');

// Additional test: HttpOnly cookie with Domain attribute
promise_test(async t => {
  const currentUrl = new URL(self.location.href);
  const currentDomain = currentUrl.hostname;

  await setCookieStringHttp(`HTTPONLY-domain=value; path=/; httponly; Domain=${currentDomain}`);
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-domain=DELETED; path=/; httponly; Domain=${currentDomain}; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie with Domain is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      `HTTPONLY-domain=value`,
    'HttpOnly cookie with Domain is visible via HTTP');
}, 'HttpOnly cookie with Domain attribute');

// Additional test: HttpOnly cookie with Path attribute
promise_test(async t => {
  const currentUrl = new URL(self.location.href);
  const currentPath = currentUrl.pathname;
  const currentDirectory =
      currentPath.substr(0, currentPath.lastIndexOf('/') + 1);

  await setCookieStringHttp(`HTTPONLY-path=value; path=${currentDirectory}; httponly`);
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-path=DELETED; path=${currentDirectory}; httponly; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie with Path is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      `HTTPONLY-path=value`,
    'HttpOnly cookie with Path is visible via HTTP');
}, 'HttpOnly cookie with Path attribute');

// Additional test: HttpOnly cookie expiration
promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-expire=value; path=/; httponly; max-age=0');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-expire=DELETED; path=/; httponly; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'Expired HttpOnly cookie is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      undefined,
    'Expired HttpOnly cookie is not visible via HTTP');
}, 'HttpOnly cookie with max-age=0 expires immediately');

// Additional test: Multiple HttpOnly cookies
promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-multi1=value1; path=/; httponly');
  await setCookieStringHttp('HTTPONLY-multi2=value2; path=/; httponly');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-multi1=DELETED; path=/; httponly; Max-Age=0`);
    await setCookieStringHttp(`HTTPONLY-multi2=DELETED; path=/; httponly; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'Multiple HttpOnly cookies are invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-multi1=value1; HTTPONLY-multi2=value2',
    'Multiple HttpOnly cookies are visible via HTTP');
}, 'Multiple HttpOnly cookies');

// Additional test: HttpOnly cookie with Partitioned attribute
promise_test(async t => {
  await setCookieStringHttp('HTTPONLY-partitioned=value; path=/; httponly; Partitioned');
  t.add_cleanup(async () => {
    await setCookieStringHttp(`HTTPONLY-partitioned=DELETED; path=/; httponly; Partitioned; Max-Age=0`);
  });

  assert_equals(
      await getCookieString(),
      undefined,
      'HttpOnly cookie with Partitioned is invisible to script');
  assert_equals(
      await getCookieStringHttp(),
      'HTTPONLY-partitioned=value',
    'HttpOnly cookie with Partitioned is visible via HTTP');
}, 'HttpOnly cookie with Partitioned attribute');
