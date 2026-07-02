export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// Falls back to 30 days if a token's real expiry can't be decoded.
export const DEFAULT_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

// Page paths reachable without being signed in.
export const PUBLIC_PATHS = ["/signin", "/register"];

// Where to send a signed-in user who lands on a public-only path.
export const DEFAULT_AUTHENTICATED_PATH = "/";
