import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Card", () => {
  let Card;
  let mockEnv;
  let mockId;

  beforeEach(async () => {
    vi.resetModules();

    // Mock database methods
    const mockDB = {
      prepare: vi.fn((sql) => ({
        bind: vi.fn((...args) => ({
          run: vi.fn(async () => ({ success: true })),
          all: vi.fn(async () => ({ results: [] })),
          first: vi.fn(async () => null),
        })),
      })),
    };

    // Mock env
    mockEnv = {
      DB: mockDB,
    };

    // Mock Id
    mockId = {
      new: vi.fn(() => "test_card_id_123"),
    };

    // Mock dependencies
    vi.doMock("@env", () => ({ default: mockEnv }));
    vi.doMock("@id", () => ({ default: mockId }));

    // Import after mocking
    const module = await import("./card.js");
    Card = module.default;
  });

  describe("Card.create", () => {
    it("should create a new card", async () => {
      const deck = { id: "deck_123" };
      const card = {
        front: "Question",
        back: "Answer",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "user_123" };

      const { data, error } = await Card.create(deck, card, user);

      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data.id).toBe("test_card_id_123");
      expect(data.front).toBe("Question");
      expect(data.back).toBe("Answer");
      expect(data.deck_id).toBe("deck_123");
      expect(data.user_id).toBe("user_123");
    });

    it("should generate a unique ID", async () => {
      const deck = { id: "deck_123" };
      const card = {
        front: "Q",
        back: "A",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "user_123" };

      await Card.create(deck, card, user);

      expect(mockId.new).toHaveBeenCalled();
    });

    it("should set created_at timestamp", async () => {
      const beforeCreate = Date.now();
      const deck = { id: "deck_123" };
      const card = {
        front: "Q",
        back: "A",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "user_123" };

      const { data } = await Card.create(deck, card, user);
      const afterCreate = Date.now();

      expect(data.created_at).toBeGreaterThanOrEqual(beforeCreate);
      expect(data.created_at).toBeLessThanOrEqual(afterCreate);
    });

    it("should include all FSRS fields", async () => {
      const deck = { id: "deck_123" };
      const card = {
        front: "What is FSRS?",
        back: "Free Spaced Repetition Scheduler",
        state: 1,
        stability: 2.5,
        difficulty: 4.8,
        due: Date.now() + 600000,
        last_review: Date.now(),
        reps: 1,
        lapses: 0,
      };
      const user = { id: "user_123" };

      const { data } = await Card.create(deck, card, user);

      expect(data.state).toBe(1);
      expect(data.stability).toBe(2.5);
      expect(data.difficulty).toBe(4.8);
      expect(data.due).toBe(card.due);
      expect(data.last_review).toBe(card.last_review);
      expect(data.reps).toBe(1);
      expect(data.lapses).toBe(0);
    });

    it("should call database with correct SQL", async () => {
      const deck = { id: "deck_123" };
      const card = {
        front: "Q",
        back: "A",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "user_123" };

      await Card.create(deck, card, user);

      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO card"),
      );
    });

    it("should bind all parameters correctly", async () => {
      const bindMock = vi.fn(() => ({
        run: vi.fn(async () => ({ success: true })),
      }));
      mockEnv.DB.prepare.mockReturnValue({ bind: bindMock });

      const deck = { id: "deck_456" };
      const card = {
        front: "Front",
        back: "Back",
        state: 2,
        stability: 10.5,
        difficulty: 3.2,
        due: 1703001600000,
        last_review: 1703001500000,
        reps: 5,
        lapses: 1,
      };
      const user = { id: "user_789" };

      await Card.create(deck, card, user);

      expect(bindMock).toHaveBeenCalledWith(
        "test_card_id_123",
        "Front",
        "Back",
        2,
        10.5,
        3.2,
        1703001600000,
        1703001500000,
        5,
        1,
        expect.any(Number), // created_at
        "deck_456",
        "user_789",
      );
    });

    it("should return error on database failure", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: false })),
        })),
      });

      const deck = { id: "deck_123" };
      const card = {
        front: "Q",
        back: "A",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "user_123" };

      const { data, error } = await Card.create(deck, card, user);

      expect(data).toBeUndefined();
      expect(error).toBe("Failed to create card");
    });
  });

  describe("Card.get", () => {
    it("should retrieve a card by id", async () => {
      const expectedCard = {
        id: "card_123",
        front: "Question",
        back: "Answer",
        state: 2,
        stability: 15.5,
        difficulty: 4.2,
        due: 1703001600000,
        last_review: 1703001500000,
        reps: 10,
        lapses: 2,
        created_at: 1703001400000,
        deck_id: "deck_123",
        user_id: "user_123",
      };

      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          first: vi.fn(async () => expectedCard),
        })),
      });

      const { data, error } = await Card.get(
        { id: "card_123" },
        { id: "user_123" },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(expectedCard);
    });

    it("should call database with correct SQL", async () => {
      await Card.get({ id: "card_123" }, { id: "user_123" });

      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM card"),
      );
      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ? AND user_id = ?"),
      );
    });

    it("should bind card id and user id", async () => {
      const bindMock = vi.fn(() => ({
        first: vi.fn(async () => ({ id: "card_123" })),
      }));
      mockEnv.DB.prepare.mockReturnValue({ bind: bindMock });

      await Card.get({ id: "card_123" }, { id: "user_456" });

      expect(bindMock).toHaveBeenCalledWith("card_123", "user_456");
    });

    it("should return error when card not found", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          first: vi.fn(async () => null),
        })),
      });

      const { data, error } = await Card.get(
        { id: "nonexistent" },
        { id: "user_123" },
      );

      expect(data).toBeUndefined();
      expect(error).toBe("Failed to get card");
    });

    it("should not return cards from other users", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          first: vi.fn(async () => null),
        })),
      });

      const { data, error } = await Card.get(
        { id: "card_123" },
        { id: "different_user" },
      );

      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    });
  });

  describe("Card.list", () => {
    it("should list all cards in a deck", async () => {
      const expectedCards = [
        {
          id: "card_1",
          front: "Q1",
          back: "A1",
          state: 0,
          stability: 0,
          difficulty: 5,
          due: Date.now(),
          last_review: null,
          reps: 0,
          lapses: 0,
          created_at: 1703001600000,
          deck_id: "deck_123",
          user_id: "user_123",
        },
        {
          id: "card_2",
          front: "Q2",
          back: "A2",
          state: 1,
          stability: 2.5,
          difficulty: 4.8,
          due: Date.now() + 600000,
          last_review: Date.now(),
          reps: 1,
          lapses: 0,
          created_at: 1703001500000,
          deck_id: "deck_123",
          user_id: "user_123",
        },
      ];

      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          all: vi.fn(async () => ({ results: expectedCards })),
        })),
      });

      const { data, error } = await Card.list(
        { id: "deck_123" },
        { id: "user_123" },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(expectedCards);
      expect(data).toHaveLength(2);
    });

    it("should return empty array when deck has no cards", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          all: vi.fn(async () => ({ results: [] })),
        })),
      });

      const { data, error } = await Card.list(
        { id: "deck_123" },
        { id: "user_123" },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual([]);
    });

    it("should filter by deck_id and user_id", async () => {
      const bindMock = vi.fn(() => ({
        all: vi.fn(async () => ({ results: [] })),
      }));
      mockEnv.DB.prepare.mockReturnValue({ bind: bindMock });

      await Card.list({ id: "deck_789" }, { id: "user_456" });

      expect(bindMock).toHaveBeenCalledWith("deck_789", "user_456");
    });

    it("should order by created_at DESC", async () => {
      await Card.list({ id: "deck_123" }, { id: "user_123" });

      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY created_at DESC"),
      );
    });

    it("should throw error on database failure with null results", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          all: vi.fn(async () => null),
        })),
      });

      // The current implementation will throw when trying to destructure null
      await expect(
        Card.list({ id: "deck_123" }, { id: "user_123" }),
      ).rejects.toThrow();
    });
  });

  describe("Card.update", () => {
    it("should update card content and FSRS fields", async () => {
      const card = {
        id: "card_123",
        front: "Updated Question",
        back: "Updated Answer",
        state: 2,
        stability: 20.5,
        difficulty: 3.5,
        due: Date.now() + 86400000,
        last_review: Date.now(),
        reps: 15,
        lapses: 1,
      };
      const user = { id: "user_123" };

      const { data, error } = await Card.update(card, user);

      expect(error).toBeUndefined();
      expect(data).toBe(true);
    });

    it("should call database with correct SQL", async () => {
      const card = {
        id: "card_123",
        front: "Q",
        back: "A",
        state: 1,
        stability: 5,
        difficulty: 5,
        due: Date.now(),
        last_review: Date.now(),
        reps: 2,
        lapses: 0,
      };
      const user = { id: "user_123" };

      await Card.update(card, user);

      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE card"),
      );
      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining(
          "SET front = ?, back = ?, state = ?, stability = ?, difficulty = ?, due = ?, last_review = ?, reps = ?, lapses = ?",
        ),
      );
    });

    it("should bind all update parameters", async () => {
      const bindMock = vi.fn(() => ({
        run: vi.fn(async () => ({ success: true })),
      }));
      mockEnv.DB.prepare.mockReturnValue({ bind: bindMock });

      const card = {
        id: "card_456",
        front: "New Front",
        back: "New Back",
        state: 3,
        stability: 5.5,
        difficulty: 6.2,
        due: 1703001700000,
        last_review: 1703001600000,
        reps: 8,
        lapses: 3,
      };
      const user = { id: "user_789" };

      await Card.update(card, user);

      expect(bindMock).toHaveBeenCalledWith(
        "New Front",
        "New Back",
        3,
        5.5,
        6.2,
        1703001700000,
        1703001600000,
        8,
        3,
        "card_456",
        "user_789",
      );
    });

    it("should return error on update failure", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: false })),
        })),
      });

      const card = {
        id: "card_123",
        front: "Q",
        back: "A",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "user_123" };

      const { data, error } = await Card.update(card, user);

      expect(data).toBeUndefined();
      expect(error).toBe("Card not found or not authorized");
    });

    it("should not update cards owned by other users", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: false })),
        })),
      });

      const card = {
        id: "card_123",
        front: "Hacked",
        back: "Hacked",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };
      const user = { id: "different_user" };

      const { data, error } = await Card.update(card, user);

      expect(data).toBeUndefined();
      expect(error).toBe("Card not found or not authorized");
    });
  });

  describe("Card.delete", () => {
    it("should delete a card", async () => {
      const { data, error } = await Card.delete(
        { id: "card_123" },
        { id: "user_123" },
      );

      expect(error).toBeUndefined();
      expect(data).toBe(true);
    });

    it("should call database with correct SQL", async () => {
      await Card.delete({ id: "card_123" }, { id: "user_123" });

      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM card"),
      );
      expect(mockEnv.DB.prepare).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = ? AND user_id = ?"),
      );
    });

    it("should bind card id and user id", async () => {
      const bindMock = vi.fn(() => ({
        run: vi.fn(async () => ({ success: true })),
      }));
      mockEnv.DB.prepare.mockReturnValue({ bind: bindMock });

      await Card.delete({ id: "card_789" }, { id: "user_456" });

      expect(bindMock).toHaveBeenCalledWith("card_789", "user_456");
    });

    it("should return error on delete failure", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: false })),
        })),
      });

      const { data, error } = await Card.delete(
        { id: "card_123" },
        { id: "user_123" },
      );

      expect(data).toBeUndefined();
      expect(error).toBe("Card not found or not authorized");
    });

    it("should not delete cards owned by other users", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: false })),
        })),
      });

      const { data, error } = await Card.delete(
        { id: "card_123" },
        { id: "different_user" },
      );

      expect(data).toBeUndefined();
      expect(error).toBe("Card not found or not authorized");
    });
  });

  describe("FSRS states", () => {
    it("should handle New state (0)", async () => {
      const card = {
        front: "Q",
        back: "A",
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.state).toBe(0);
      expect(data.reps).toBe(0);
      expect(data.last_review).toBeNull();
    });

    it("should handle Learning state (1)", async () => {
      const card = {
        front: "Q",
        back: "A",
        state: 1,
        stability: 2.5,
        difficulty: 4.8,
        due: Date.now() + 600000,
        last_review: Date.now(),
        reps: 1,
        lapses: 0,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.state).toBe(1);
      expect(data.stability).toBe(2.5);
      expect(data.reps).toBe(1);
    });

    it("should handle Review state (2)", async () => {
      const card = {
        front: "Q",
        back: "A",
        state: 2,
        stability: 45.2,
        difficulty: 3.1,
        due: Date.now() + 2592000000,
        last_review: Date.now(),
        reps: 15,
        lapses: 1,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.state).toBe(2);
      expect(data.stability).toBeGreaterThan(40);
      expect(data.reps).toBeGreaterThan(10);
    });

    it("should handle Relearning state (3)", async () => {
      const card = {
        front: "Q",
        back: "A",
        state: 3,
        stability: 5.5,
        difficulty: 6.8,
        due: Date.now() + 300000,
        last_review: Date.now(),
        reps: 8,
        lapses: 2,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.state).toBe(3);
      expect(data.lapses).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle very long front/back content", async () => {
      const longText = "A".repeat(10000);
      const card = {
        front: longText,
        back: longText,
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.front).toBe(longText);
      expect(data.back).toBe(longText);
    });

    it("should handle special characters", async () => {
      const specialText = "<>&\"' Test";
      const card = {
        front: specialText,
        back: specialText,
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.front).toBe(specialText);
    });

    it("should handle unicode content", async () => {
      const unicodeText = "日本語 🃏 Español";
      const card = {
        front: unicodeText,
        back: unicodeText,
        state: 0,
        stability: 0,
        difficulty: 5,
        due: Date.now(),
        last_review: null,
        reps: 0,
        lapses: 0,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.front).toBe(unicodeText);
    });

    it("should handle very high stability values", async () => {
      const card = {
        front: "Q",
        back: "A",
        state: 2,
        stability: 999.99,
        difficulty: 1.5,
        due: Date.now() + 31536000000, // 1 year
        last_review: Date.now(),
        reps: 100,
        lapses: 0,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.stability).toBe(999.99);
    });

    it("should handle very high difficulty values", async () => {
      const card = {
        front: "Q",
        back: "A",
        state: 2,
        stability: 5,
        difficulty: 10,
        due: Date.now(),
        last_review: Date.now(),
        reps: 50,
        lapses: 20,
      };

      const { data } = await Card.create(
        { id: "deck_123" },
        card,
        { id: "user_123" },
      );

      expect(data.difficulty).toBe(10);
      expect(data.lapses).toBe(20);
    });
  });

  describe("Result pattern", () => {
    it("should return { data } on success", async () => {
      const result = await Card.create(
        { id: "deck_123" },
        {
          front: "Q",
          back: "A",
          state: 0,
          stability: 0,
          difficulty: 5,
          due: Date.now(),
          last_review: null,
          reps: 0,
          lapses: 0,
        },
        { id: "user_123" },
      );

      expect(result).toHaveProperty("data");
      expect(result).not.toHaveProperty("error");
    });

    it("should return { error } on failure", async () => {
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn(() => ({
          run: vi.fn(async () => ({ success: false })),
        })),
      });

      const result = await Card.create(
        { id: "deck_123" },
        {
          front: "Q",
          back: "A",
          state: 0,
          stability: 0,
          difficulty: 5,
          due: Date.now(),
          last_review: null,
          reps: 0,
          lapses: 0,
        },
        { id: "user_123" },
      );

      expect(result).toHaveProperty("error");
      expect(result).not.toHaveProperty("data");
    });
  });
});
