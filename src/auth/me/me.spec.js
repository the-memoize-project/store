import { beforeEach, describe, expect, it, vi } from "vitest";

describe("me middleware", () => {
  let me;
  let mockGoogle;
  let mockHeaders;

  beforeEach(async () => {
    // Reset modules
    vi.resetModules();

    // Mock Google OAuth
    mockGoogle = {
      me: vi.fn(),
    };

    // Mock headers
    mockHeaders = {
      authorization: "",
    };

    // Mock the dependencies
    vi.doMock("@the-memoize-project/auth", () => ({
      Google: mockGoogle,
    }));

    vi.doMock("@the-memoize-project/router/worker", () => ({
      headers: mockHeaders,
    }));

    // Import after mocking
    const module = await import("./me.js");
    me = module.default;
  });

  describe("Authentication success", () => {
    it("should call next handler with valid user", async () => {
      const mockUser = {
        id: "123",
        email: "user@example.com",
        name: "Test User",
        picture: "https://example.com/pic.jpg",
      };

      mockGoogle.me.mockResolvedValue(mockUser);
      mockHeaders.authorization = "Bearer valid_token";

      const nextHandler = vi.fn(() => new Response("Success"));
      const handler = me(nextHandler);

      await handler();

      expect(mockGoogle.me).toHaveBeenCalledWith("Bearer valid_token");
      expect(nextHandler).toHaveBeenCalledWith(mockUser);
    });

    it("should pass user object to next handler", async () => {
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        name: "John Doe",
        picture: "https://pic.example.com/user.jpg",
      };

      mockGoogle.me.mockResolvedValue(mockUser);
      mockHeaders.authorization = "Bearer token123";

      let receivedUser;
      const nextHandler = (user) => {
        receivedUser = user;
        return new Response("OK");
      };

      const handler = me(nextHandler);
      await handler();

      expect(receivedUser).toEqual(mockUser);
      expect(receivedUser.id).toBe("user_123");
      expect(receivedUser.email).toBe("test@example.com");
    });

    it("should return response from next handler", async () => {
      const mockUser = { id: "123" };
      mockGoogle.me.mockResolvedValue(mockUser);
      mockHeaders.authorization = "Bearer token";

      const expectedResponse = new Response("Custom response", {
        status: 200,
      });
      const nextHandler = vi.fn(() => expectedResponse);

      const handler = me(nextHandler);
      const response = await handler();

      expect(response).toBe(expectedResponse);
    });

    it("should work with async next handler", async () => {
      const mockUser = { id: "123" };
      mockGoogle.me.mockResolvedValue(mockUser);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn(async (user) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return new Response(JSON.stringify({ userId: user.id }));
      });

      const handler = me(nextHandler);
      const response = await handler();

      expect(nextHandler).toHaveBeenCalled();
      expect(response).toBeInstanceOf(Response);
    });
  });

  describe("Authentication failure", () => {
    it("should return 401 when user has no id", async () => {
      const invalidUser = {
        email: "test@example.com",
        // Missing id
      };

      mockGoogle.me.mockResolvedValue(invalidUser);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);
      const response = await handler();

      expect(response.status).toBe(401);
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it("should return 401 when user is null", async () => {
      mockGoogle.me.mockResolvedValue(null);
      mockHeaders.authorization = "Bearer invalid_token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);
      const response = await handler();

      expect(response.status).toBe(401);
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it("should return 401 when user is undefined", async () => {
      mockGoogle.me.mockResolvedValue(undefined);
      mockHeaders.authorization = "Bearer invalid_token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);
      const response = await handler();

      expect(response.status).toBe(401);
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it("should return 401 with null body", async () => {
      mockGoogle.me.mockResolvedValue(null);
      mockHeaders.authorization = "Bearer invalid_token";

      const handler = me(() => new Response("Should not reach"));
      const response = await handler();

      expect(response.status).toBe(401);
      expect(await response.text()).toBe("");
    });

    it("should not call next handler on invalid user", async () => {
      mockGoogle.me.mockResolvedValue({ email: "test@example.com" }); // No id
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);

      await handler();

      expect(nextHandler).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should return 500 when Google.me throws error", async () => {
      mockGoogle.me.mockRejectedValue(new Error("OAuth failed"));
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);
      const response = await handler();

      expect(response.status).toBe(500);
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it("should return 500 on network error", async () => {
      mockGoogle.me.mockRejectedValue(new Error("Network error"));
      mockHeaders.authorization = "Bearer token";

      const handler = me(() => new Response("Should not reach"));
      const response = await handler();

      expect(response.status).toBe(500);
    });

    it("should return 500 with null body on error", async () => {
      mockGoogle.me.mockRejectedValue(new Error("Auth error"));
      mockHeaders.authorization = "Bearer token";

      const handler = me(() => new Response("Should not reach"));
      const response = await handler();

      expect(response.status).toBe(500);
      expect(await response.text()).toBe("");
    });

    it("should handle synchronous errors", async () => {
      mockGoogle.me.mockImplementation(() => {
        throw new Error("Sync error");
      });
      mockHeaders.authorization = "Bearer token";

      const handler = me(() => new Response("Should not reach"));
      const response = await handler();

      expect(response.status).toBe(500);
    });

    it("should not expose error details", async () => {
      mockGoogle.me.mockRejectedValue(
        new Error("Sensitive error information"),
      );
      mockHeaders.authorization = "Bearer token";

      const handler = me(() => new Response("Should not reach"));
      const response = await handler();

      const body = await response.text();
      expect(body).not.toContain("Sensitive");
      expect(body).toBe(""); // Should be empty
    });
  });

  describe("Token handling", () => {
    it("should pass authorization header to Google.me", async () => {
      const token = "Bearer ya29.a0AfH6SMC...";
      mockGoogle.me.mockResolvedValue({ id: "123" });
      mockHeaders.authorization = token;

      const handler = me(() => new Response("OK"));
      await handler();

      expect(mockGoogle.me).toHaveBeenCalledWith(token);
    });

    it("should handle empty authorization header", async () => {
      mockHeaders.authorization = "";
      mockGoogle.me.mockResolvedValue(null);

      const handler = me(() => new Response("OK"));
      const response = await handler();

      expect(response.status).toBe(401);
      expect(mockGoogle.me).toHaveBeenCalledWith("");
    });

    it("should handle different token formats", async () => {
      const tokens = [
        "Bearer abc123",
        "Bearer ya29.a0AfH6SMC...",
        "bearer lowercase",
      ];

      for (const token of tokens) {
        mockHeaders.authorization = token;
        mockGoogle.me.mockResolvedValue({ id: "123" });

        const handler = me(() => new Response("OK"));
        await handler();

        expect(mockGoogle.me).toHaveBeenCalledWith(token);
      }
    });
  });

  describe("Curried function pattern", () => {
    it("should return a function when called with next", () => {
      const nextHandler = () => new Response("OK");
      const handler = me(nextHandler);

      expect(typeof handler).toBe("function");
    });

    it("should be callable without arguments", async () => {
      mockGoogle.me.mockResolvedValue({ id: "123" });
      mockHeaders.authorization = "Bearer token";

      const nextHandler = () => new Response("OK");
      const handler = me(nextHandler);

      // Should be callable with no args
      const response = await handler();
      expect(response).toBeInstanceOf(Response);
    });

    it("should support middleware composition", async () => {
      mockGoogle.me.mockResolvedValue({ id: "123", email: "test@example.com" });
      mockHeaders.authorization = "Bearer token";

      const logger = (next) => (user) => {
        console.log("User:", user.id);
        return next(user);
      };

      const handler = (user) => {
        return new Response(JSON.stringify({ userId: user.id }));
      };

      const composed = me(logger(handler));
      const response = await composed();

      expect(response.status).toBe(200);
    });

    it("should allow reusing middleware", async () => {
      mockGoogle.me.mockResolvedValue({ id: "123" });
      mockHeaders.authorization = "Bearer token";

      const handler1 = me(() => new Response("Handler 1"));
      const handler2 = me(() => new Response("Handler 2"));

      const response1 = await handler1();
      const response2 = await handler2();

      expect(await response1.text()).toBe("Handler 1");
      expect(await response2.text()).toBe("Handler 2");
    });
  });

  describe("Response types", () => {
    it("should handle JSON responses", async () => {
      const mockUser = { id: "123" };
      mockGoogle.me.mockResolvedValue(mockUser);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = (user) =>
        new Response(JSON.stringify({ user }), {
          headers: { "Content-Type": "application/json" },
        });

      const handler = me(nextHandler);
      const response = await handler();

      const data = await response.json();
      expect(data.user).toEqual(mockUser);
    });

    it("should handle text responses", async () => {
      mockGoogle.me.mockResolvedValue({ id: "123" });
      mockHeaders.authorization = "Bearer token";

      const nextHandler = () => new Response("Plain text response");

      const handler = me(nextHandler);
      const response = await handler();

      expect(await response.text()).toBe("Plain text response");
    });

    it("should handle custom status codes", async () => {
      mockGoogle.me.mockResolvedValue({ id: "123" });
      mockHeaders.authorization = "Bearer token";

      const nextHandler = () =>
        new Response("Created", {
          status: 201,
        });

      const handler = me(nextHandler);
      const response = await handler();

      expect(response.status).toBe(201);
    });

    it("should preserve response headers", async () => {
      mockGoogle.me.mockResolvedValue({ id: "123" });
      mockHeaders.authorization = "Bearer token";

      const nextHandler = () =>
        new Response("OK", {
          headers: {
            "X-Custom-Header": "value",
            "Content-Type": "application/json",
          },
        });

      const handler = me(nextHandler);
      const response = await handler();

      expect(response.headers.get("X-Custom-Header")).toBe("value");
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });
  });

  describe("User object validation", () => {
    it("should accept user with all fields", async () => {
      const completeUser = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/pic.jpg",
      };

      mockGoogle.me.mockResolvedValue(completeUser);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn(() => new Response("OK"));
      const handler = me(nextHandler);

      await handler();

      expect(nextHandler).toHaveBeenCalledWith(completeUser);
    });

    it("should accept user with only id", async () => {
      const minimalUser = { id: "123" };

      mockGoogle.me.mockResolvedValue(minimalUser);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn(() => new Response("OK"));
      const handler = me(nextHandler);

      await handler();

      expect(nextHandler).toHaveBeenCalledWith(minimalUser);
    });

    it("should reject user with id = 0", async () => {
      const userWithZeroId = { id: 0 };

      mockGoogle.me.mockResolvedValue(userWithZeroId);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);
      const response = await handler();

      // Falsy id should result in 401
      expect(response.status).toBe(401);
      expect(nextHandler).not.toHaveBeenCalled();
    });

    it("should reject user with empty string id", async () => {
      const userWithEmptyId = { id: "" };

      mockGoogle.me.mockResolvedValue(userWithEmptyId);
      mockHeaders.authorization = "Bearer token";

      const nextHandler = vi.fn();
      const handler = me(nextHandler);
      const response = await handler();

      expect(response.status).toBe(401);
      expect(nextHandler).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle null authorization header", async () => {
      mockHeaders.authorization = null;
      mockGoogle.me.mockResolvedValue(null);

      const handler = me(() => new Response("OK"));
      const response = await handler();

      expect(response.status).toBe(401);
    });

    it("should handle undefined authorization header", async () => {
      mockHeaders.authorization = undefined;
      mockGoogle.me.mockResolvedValue(null);

      const handler = me(() => new Response("OK"));
      const response = await handler();

      expect(response.status).toBe(401);
    });

    it("should handle user object with extra fields", async () => {
      const userWithExtra = {
        id: "123",
        email: "test@example.com",
        extraField: "should be passed through",
      };

      mockGoogle.me.mockResolvedValue(userWithExtra);
      mockHeaders.authorization = "Bearer token";

      let receivedUser;
      const nextHandler = (user) => {
        receivedUser = user;
        return new Response("OK");
      };

      const handler = me(nextHandler);
      await handler();

      expect(receivedUser.extraField).toBe("should be passed through");
    });
  });
});
