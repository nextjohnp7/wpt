// META: title=Cookie Store API: Observing 'change' events in document when cookies set via document.cookie
// META: script=resources/cookie-test-helpers.js

'use strict';

cookie_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-cookie=value; path=/');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-cookie=value',
      'Cookie we wrote using document.cookie in cookie jar');
  assert_equals(
    await getCookieStringHttp(),
    'DOCUMENT-cookie=value',
    'Cookie we wrote using document.cookie in HTTP cookie jar');
  assert_equals(
      await getCookieStringDocument(),
      'DOCUMENT-cookie=value',
      'Cookie we wrote using document.cookie in document.cookie');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-cookie', value: 'value'}]},
      'Cookie we wrote using document.cookie is observed');

  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-cookie=new-value; path=/');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-cookie=new-value',
      'Cookie we overwrote using document.cookie in cookie jar');
  assert_equals(
    await getCookieStringHttp(),
    'DOCUMENT-cookie=new-value',
    'Cookie we overwrote using document.cookie in HTTP cookie jar');
  assert_equals(
      await getCookieStringDocument(),
      'DOCUMENT-cookie=new-value',
      'Cookie we overwrote using document.cookie in document.cookie');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-cookie', value: 'new-value'}]},
      'Cookie we overwrote using document.cookie is observed');

  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-cookie=DELETED; path=/; max-age=0');
  assert_equals(
      await getCookieString(),
      undefined,
      'Empty cookie jar after document.cookie' +
        ' cookie-clearing using max-age=0');
  assert_equals(
    await getCookieStringHttp(),
    undefined,
    'Empty HTTP cookie jar after document.cookie' +
        ' cookie-clearing using max-age=0');
  assert_equals(
      await getCookieStringDocument(),
      undefined,
      'Empty document.cookie cookie jar after document.cookie' +
        ' cookie-clearing using max-age=0');
  await verifyCookieChangeEvent(
    eventPromise, {deleted: [{name: 'DOCUMENT-cookie'}]},
      'Deletion observed after document.cookie cookie-clearing' +
        ' using max-age=0');
}, 'document.cookie set/overwrite/delete observed by CookieStore');


cookie_test(async t => {
  const eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-cookie=ALREADY-EXPIRED; path=/; max-age=0');
  await setCookieStringDocument('DOCUMENT-alt-cookie=IGNORE; path=/; max-age=10');
  assert_equals(
    await getCookieStringDocument(),
    'DOCUMENT-alt-cookie=IGNORE',
    'Already-expired cookie not included in document.cookie');
  await verifyCookieChangeEvent(
    eventPromise,
    {deleted: [], changed: [{name: 'DOCUMENT-alt-cookie', value: 'IGNORE'}]},
    'Deletion not observed after document.cookie sets already-expired cookie');
}, 'document.cookie set already-expired cookie should not be observed by CookieStore');

cookie_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-cookie=VALUE; path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-cookie', value: 'VALUE'}]},
      'Original cookie is observed.');

  eventPromise = observeNextCookieChangeEvent();
  // Overwrite the original cookie with a duplicate, this should not dispatch an event.
  await setCookieStringDocument('DOCUMENT-cookie=VALUE; path=/');
  await setCookieStringDocument('DOCUMENT-alt-cookie=IGNORE; path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-alt-cookie', value: 'IGNORE'}]},
    'Duplicate cookie is not observed.');
}, 'document.cookie duplicate cookie should not be observed by CookieStore');

cookie_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await cookieStore.set('DOCUMENT-cookie', 'value');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-cookie=value',
      'Cookie we wrote using CookieStore in cookie jar');
  assert_equals(
    await getCookieStringHttp(),
    'DOCUMENT-cookie=value',
    'Cookie we wrote using CookieStore in HTTP cookie jar');
  assert_equals(
      await getCookieStringDocument(),
      'DOCUMENT-cookie=value',
      'Cookie we wrote using CookieStore in document.cookie');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-cookie', value: 'value'}]},
      'Cookie we wrote using CookieStore is observed');

  eventPromise = observeNextCookieChangeEvent();
  await cookieStore.set('DOCUMENT-cookie', 'new-value');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-cookie=new-value',
      'Cookie we overwrote using CookieStore in cookie jar');
  assert_equals(
    await getCookieStringHttp(),
    'DOCUMENT-cookie=new-value',
    'Cookie we overwrote using CookieStore in HTTP cookie jar');
  assert_equals(
      await getCookieStringDocument(),
      'DOCUMENT-cookie=new-value',
      'Cookie we overwrote using CookieStore in document.cookie');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-cookie', value: 'new-value'}]},
      'Cookie we overwrote using CookieStore is observed');

  eventPromise = observeNextCookieChangeEvent();
  await cookieStore.delete('DOCUMENT-cookie');
  assert_equals(
      await getCookieString(),
      undefined,
      'Empty cookie jar after CookieStore delete');
  assert_equals(
    await getCookieStringHttp(),
    undefined,
    'Empty HTTP cookie jar after CookieStore delete');
  assert_equals(
      await getCookieStringDocument(),
      undefined,
      'Empty document.cookie cookie jar after CookieStore delete');
  await verifyCookieChangeEvent(
    eventPromise, {deleted: [{name: 'DOCUMENT-cookie'}]},
      'Deletion observed after CookieStore delete');
}, 'CookieStore set/overwrite/delete observed by document.cookie');


cookie_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-🍪=🔵; path=/');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-🍪=🔵',
      'Cookie we wrote using document.cookie in cookie jar');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-🍪', value: '🔵'}]},
      'Cookie we wrote using document.cookie is observed');

  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-🍪=DELETED; path=/; max-age=0');
  assert_equals(
      await getCookieString(),
      undefined,
      'Empty cookie jar after document.cookie' +
        ' cookie-clearing using max-age=0');
  await verifyCookieChangeEvent(
    eventPromise, {deleted: [{name: 'DOCUMENT-🍪'}]},
      'Deletion observed after document.cookie cookie-clearing' +
        ' using max-age=0');
}, 'CookieStore agrees with document.cookie on encoding non-ASCII cookies');


cookie_test(async t => {
  await cookieStore.set('DOCUMENT-🍪', '🔵');
  assert_equals(
      await getCookieStringDocument(),
      'DOCUMENT-🍪=🔵',
      'Cookie we wrote using CookieStore in document.cookie');

  await cookieStore.delete('DOCUMENT-🍪');
  assert_equals(
      await getCookieStringDocument(),
      undefined,
      'Empty cookie jar after CookieStore delete');
}, 'document.cookie agrees with CookieStore on encoding non-ASCII cookies');


// 1. Partitioned Cookies
cookie_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-partitioned=value; path=/; Partitioned');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-partitioned=value',
      'Partitioned cookie we wrote using document.cookie in cookie jar');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-partitioned', value: 'value'}]},
      'Partitioned cookie we wrote using document.cookie is observed');

  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-partitioned=DELETED; path=/; max-age=0; Partitioned');
  assert_equals(
      await getCookieString(),
      undefined,
      'Empty cookie jar after document.cookie partitioned cookie-clearing');
  await verifyCookieChangeEvent(
    eventPromise, {deleted: [{name: 'DOCUMENT-partitioned'}]},
      'Deletion observed after document.cookie partitioned cookie-clearing');
}, 'document.cookie partitioned cookie observed by CookieStore');

// 2. SameSite Attribute
cookie_test(async t => {
  // SameSite=Strict
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-samesite-strict=value; path=/; SameSite=Strict');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-samesite-strict', value: 'value'}]},
      'SameSite=Strict cookie observed');

  // SameSite=Lax
  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-samesite-lax=value; path=/; SameSite=Lax');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-samesite-lax', value: 'value'}]},
      'SameSite=Lax cookie observed');

  // SameSite=None (requires Secure)
  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-samesite-none=value; path=/; SameSite=None; Secure');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-samesite-none', value: 'value'}]},
      'SameSite=None; Secure cookie observed');
}, 'document.cookie SameSite attribute cookies observed by CookieStore');

// 3. Secure Attribute
cookie_test(async t => {
  // Secure cookie
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-secure=value; path=/; Secure');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-secure', value: 'value'}]},
      'Secure cookie observed');

  // Non-secure cookie
  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-nonsecure=value; path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-nonsecure', value: 'value'}]},
      'Non-secure cookie observed');
}, 'document.cookie Secure attribute cookies observed by CookieStore');

// 4. Path Attribute Variations
cookie_test(async t => {
  // Cookie with specific path
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-path-specific=value; path=/specific');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-path-specific', value: 'value'}]},
      'Cookie with specific path observed');

  // Cookie with root path
  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-path-root=value; path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-path-root', value: 'value'}]},
      'Cookie with root path observed');
}, 'document.cookie Path attribute cookies observed by CookieStore');

// 5. Domain Attribute
cookie_test(async t => {
  // Cookie with domain attribute
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-domain=value; path=/; Domain=localhost');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-domain', value: 'value'}]},
      'Cookie with Domain attribute observed');
}, 'document.cookie Domain attribute cookie observed by CookieStore');

// 6. Multiple Cookies Changed at Once
cookie_test(async t => {
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-multi1=value1; path=/');
  await setCookieStringDocument('DOCUMENT-multi2=value2; path=/');
  await setCookieStringDocument('DOCUMENT-multi3=value3; path=/');
  await verifyCookieChangeEvent(
    eventPromise,
    {changed: [
      {name: 'DOCUMENT-multi1', value: 'value1'},
      {name: 'DOCUMENT-multi2', value: 'value2'},
      {name: 'DOCUMENT-multi3', value: 'value3'}
    ]},
    'Multiple cookies changed observed');
}, 'document.cookie multiple cookies changed observed by CookieStore');

// 7. Cookie Name/Value with Special Characters
cookie_test(async t => {
  // Cookie with special characters in name and value
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-special!@#$=value%^&*(); path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-special!@#$', value: 'value%^&*()'}]},
      'Cookie with special characters observed');

  // Cookie with spaces in value
  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-spaces=value with spaces; path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-spaces', value: 'value with spaces'}]},
      'Cookie with spaces in value observed');
}, 'document.cookie special characters cookies observed by CookieStore');

// 8. CookieStore in Worker Context
cookie_test(async t => {
  // Test that change events work in document context (this test runs in window)
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-worker-context=value; path=/');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-worker-context', value: 'value'}]},
      'Cookie change observed in document context');
}, 'CookieStore change event observed in document context');

// 9. Event Ordering
cookie_test(async t => {
  // Set multiple cookies and verify ordering
  let eventPromise1 = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-order1=first; path=/');
  await verifyCookieChangeEvent(
    eventPromise1, {changed: [{name: 'DOCUMENT-order1', value: 'first'}]},
      'First cookie change observed');

  let eventPromise2 = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-order2=second; path=/');
  await verifyCookieChangeEvent(
    eventPromise2, {changed: [{name: 'DOCUMENT-order2', value: 'second'}]},
      'Second cookie change observed');

  let eventPromise3 = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-order3=third; path=/');
  await verifyCookieChangeEvent(
    eventPromise3, {changed: [{name: 'DOCUMENT-order3', value: 'third'}]},
      'Third cookie change observed');
}, 'document.cookie change event ordering verified');

// 10. Empty Cookie Jar Edge Cases
cookie_test(async t => {
  // Start with empty jar, add cookie, then delete
  let eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-empty=edge; path=/');
  assert_equals(
      await getCookieString(),
      'DOCUMENT-empty=edge',
      'Cookie added to empty jar');
  await verifyCookieChangeEvent(
    eventPromise, {changed: [{name: 'DOCUMENT-empty', value: 'edge'}]},
      'Cookie added to empty jar observed');

  // Delete the cookie
  eventPromise = observeNextCookieChangeEvent();
  await setCookieStringDocument('DOCUMENT-empty=DELETED; path=/; max-age=0');
  assert_equals(
      await getCookieString(),
      undefined,
      'Cookie jar empty after deletion');
  await verifyCookieChangeEvent(
    eventPromise, {deleted: [{name: 'DOCUMENT-empty'}]},
      'Cookie deletion from single-cookie jar observed');
}, 'document.cookie empty cookie jar edge cases observed by CookieStore');
