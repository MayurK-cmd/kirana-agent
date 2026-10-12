/**
 * YOUR AGENT'S TOOLS
 *
 * A tool is just a function the agent is allowed to call.
 * Gemini reads the `description` to decide WHEN to use it,
 * and `parameters` to know WHAT to pass in.
 *
 * Add your own tool: copy one of the objects below, change it,
 * and save. It shows up in the "Tools" list on the page.
 */
import { getWalletAddress, getWalletBalance, payAndFetch } from "./wallet";

export type Tool = {
  name: string;
  description: string;
  /** JSON Schema describing the inputs. */
  parameters: object;
  /** The code that runs when the agent calls this tool. */
  run: (args: any, ctx: { baseUrl: string }) => Promise<unknown>;
};

export const tools: Tool[] = [
  // ─── 1. A paid API: the agent's wallet signs a payment to unlock it ───
  {
    name: "get_weather",
    description: "Get the current weather for a city. Costs 0.01 USDC, paid automatically from the agent's wallet.",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name, e.g. Mumbai" },
      },
      required: ["city"],
    },
    run: async ({ city }, { baseUrl }) => {
      return payAndFetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
    },
  },

  // ─── 2. Wallet tool: read the agent's own wallet ───
  {
    name: "get_my_wallet",
    description: "Get the agent's own wallet address and its ETH balance on Base Sepolia (testnet).",
    parameters: { type: "object", properties: {} },
    run: async () => ({
      address: getWalletAddress(),
      balance: await getWalletBalance(),
      network: "Base Sepolia (testnet)",
    }),
  },

  // ─── 3. A plain tool: no wallet, no API ───
  {
    name: "roll_dice",
    description: "Roll a dice with the given number of sides.",
    parameters: {
      type: "object",
      properties: {
        sides: { type: "number", description: "How many sides the dice has. Default 6." },
      },
    },
    run: async ({ sides = 6 }) => ({ rolled: Math.floor(Math.random() * sides) + 1, sides }),
  },

  // ─── 4. Week 1: Kirana mock compare (no browser yet — real webcmd lands in Week 2) ───
  {
    name: "compare_groceries",
    description:
      "Compare grocery prices between Zepto and Blinkit. Use when the user asks for groceries, milk, bread, bananas, or cheapest option. Returns mock totals for Week 1 demo.",
    parameters: {
      type: "object",
      properties: {
        request: { type: "string", description: "Natural-language grocery list, e.g. '2 bananas, 1 milk and bread'" },
      },
      required: ["request"],
    },
    run: async ({ request = "" }) => {
      // Same parser shape as anvil-monad parseGroceryRequest (Week 2 swaps this for real webcmd).
      const body = String(request)
        .trim()
        .replace(/^(please\s+)?(add|buy|get|order|purchase)\s+/i, "")
        .replace(/\s*(to\s+my\s+)?(zepto\s+)?cart\.?\s*$/i, "")
        .trim();
      const wanted = body
        .split(/\s*,\s*|\s+\band\b\s+/i)
        .map((s: string) => s.trim().replace(/\.$/, ""))
        .filter(Boolean)
        .map((segment: string) => {
          const m = segment.match(/^(\d+)\s*(?:x\s*)?(.+)$/i);
          if (!m) return { query: segment, quantity: 1 };
          return { query: m[2].trim(), quantity: Math.max(1, Math.min(12, parseInt(m[1], 10))) };
        });

      // Deterministic mock prices so Week 1 demo is stable without browser auth.
      const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
      const zeptoItems = wanted.map((w: { query: string; quantity: number }) => {
        const unitPrice = 20 + (hash(w.query) % 60);
        return { title: w.query, quantity: w.quantity, unitPrice, lineTotal: unitPrice * w.quantity, store: "Zepto" };
      });
      const blinkitItems = wanted.map((w: { query: string; quantity: number }) => {
        const unitPrice = 20 + ((hash(w.query) + 13) % 60);
        return { title: w.query, quantity: w.quantity, unitPrice, lineTotal: unitPrice * w.quantity, store: "Blinkit" };
      });
      const zeptoTotal = zeptoItems.reduce((s: number, i: { lineTotal: number }) => s + i.lineTotal, 0);
      const blinkitTotal = blinkitItems.reduce((s: number, i: { lineTotal: number }) => s + i.lineTotal, 0);
      const cheapest = zeptoTotal <= blinkitTotal ? "zepto" : "blinkit";
      return {
        workflow: "kirana-compare-v1-mock",
        status: "ready_to_compare",
        note: "Week 1 mock — no browser, no checkout. Week 2 swaps in real webcmd zepto/blinkit search + cart verify from anvil-monad.",
        zepto: { items: zeptoItems, total: zeptoTotal },
        blinkit: { items: blinkitItems, total: blinkitTotal },
        comparison: { cheapest, savings: Math.abs(zeptoTotal - blinkitTotal) },
        currency: "INR",
        checkout: { available: false, label: "Week 2 enables real cart handoff" },
      };
    },
  },
];
