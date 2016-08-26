import { atob, btoa } from 'Base64';
import config from '../config';

export const getSession = ctx => {
  const tokenCookie = ctx.cookies.get('token');
  const oldExpiresCookie = ctx.cookies.get('tokenExpires');
  const oldRefreshCookie = ctx.cookies.get('refreshToken');

  if (!tokenCookie) {
    // make extra sure we don't have the old kind of cookies laying around
    if (oldExpiresCookie || oldRefreshCookie) {
      clearSessionCookies(ctx);
    }
    return;
  }

  // token cookie is expected to always be a base64 string, period should always be excluded.
  // we use period to split chunks
  if (tokenCookie.indexOf('.') === -1) {
    if (!oldExpiresCookie || !oldRefreshCookie) {
      // we have a token cookie that looks like the new format, but we
      // don't have the expiration and refreshToken, just clear auth cookies
      clearSessionCookies(ctx.cookies);
      return;
    }

    // clear the old tokenExpires and refreshToken cookies
    clearSessionCookies(ctx.cookies);

    const newSession = {
      accessToken: tokenCookie,
      expires: oldExpiresCookie,
      refreshToken: oldRefreshCookie,
    };

    setSessionCookies(ctx, newSession);
    return newSession;
  }

  const [payloadBase64, version] = tokenCookie.split('.');
  if (parseInt(version, 10) !== 2) { // old format is implicit version 1
    // this is mostly a sanity check. if the version is not 2 then the the cookie
    // is malformed somehow, or is a new format we don't expect.
    clearSessionCookies(ctx.cookies);
    return;
  }

  try {
    const session = JSON.parse(atob(payloadBase64));
    if (!session || !session.accessToken || !session.refreshToken || !session.expires) {
      clearSessionCookies(ctx.cookies);
      return;
    }

    return session;
  } catch (e) {
    // clear the malformed cookies
    clearSessionCookies(ctx.cookies);
    // implicit return
  }
};

export const COOKIE_OPTIONS = {
  secure: config.https,
  secureProxy: config.httpsProxy,
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365,
};

export const setSessionCookies = (ctx, session) => {
  const payloadBase64 = btoa(JSON.stringify(session));
  const token = `${payloadBase64}.2`; // version 2

  // Set the token cookie to be on the root reddit domain
  // if we're not running a local copy
  const { host } = ctx.header || {};
  const options = { ...COOKIE_OPTIONS };
  if (host && host.indexOf('localhost') === -1) {
    // We set the domain here to be `.reddit.com` (for production reddit)
    // We clear the old `m.reddit.com` cookie when we convert
    // from the old format to the new format.
    options.domain = config.rootReddit;
  }

  ctx.cookies.set('token', token, options);
};


export const SESSION_COOKIES = [
  'token',
  'tokenExpires',
  'refreshToken',
];

export const clearSessionCookies = cookies => {
  const rootOptions = { domain: config.rootReddit };

  SESSION_COOKIES.map(cookieName => {
    // clear the cookie and it's signed version for `m.reddit`
    cookies.set(cookieName);
    cookies.set(`${cookieName}.sig`);
    // clear the cookie and it's signed version from `.reddit`
    cookies.set(cookieName, undefined, rootOptions);
    cookies.set(`${cookieName}.sig`, undefined, rootOptions);
  });
};

export const oauthTokenToSession = token => {
  const {
    access_token: accessToken,
    expires_at: expires,
    refresh_token: refreshToken,
  } = token.token;

  return {
    accessToken,
    expires,
    refreshToken,
  };
};
