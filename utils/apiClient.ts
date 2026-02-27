import { router } from "expo-router";
import { getToken, removeToken, storeToken } from "@/utils/Context/storageUtils";

const getRefreshUrl = () =>
  `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`;

/**
 * Try to exchange current (possibly expired) token for a new one. Uses raw fetch to avoid recursion.
 */
async function tryRefreshToken(currentToken: string): Promise<string | null> {
  try {
    const res = await fetch(getRefreshUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Centralized API client that handles authentication and error responses.
 * On 401, tries to refresh the token once (backend issues new JWT from expired one); if refresh fails, clears session.
 */
export const apiClient = {
  /**
   * Makes an authenticated API request.
   * On 401: tries refresh (exchange expired token for new one); if refresh succeeds, retries the request; otherwise clears token and redirects.
   */
  async request(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let token = await getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    let response = await fetch(url, { ...options, headers });

    // On 401, try once to refresh (expired token → new token) then retry
    if (response.status === 401 && token) {
      const newToken = await tryRefreshToken(token);
      if (newToken) {
        await storeToken(newToken);
        const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    if (response.status === 401) {
      await removeToken();
      if (router.canGoBack()) {
        router.replace("/");
      }
      throw new Error("Session expired. Please login again.");
    }

    return response;
  },

  /**
   * GET request
   */
  async get(url: string, options?: RequestInit): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  async post(url: string, body?: any, options?: RequestInit): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request
   */
  async put(url: string, body?: any, options?: RequestInit): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  async delete(url: string, options?: RequestInit): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};





