# **Agentmaxxin: Build an AI Agent with Its Own Wallet**

agentmaxxin is a starter template for building AI agents powered by Google Gemini. Your agent can use custom tools, execute functions, and manage its own crypto wallet to sign payments and access paid APIs.

## **What You Need**

1. Node.js version 20 or newer. Check your version using `node -v` or download it from [https\://nodejs.org](https://nodejs.org/).  
2. A free Google Gemini API key from [https\://aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## **Setup Guide**

### **Step 1: Create Your Project**

Open your terminal and run:

npx agentmaxxin my-agent  
cd my-agent

This creates a `my-agent` directory containing the starter template, an `.env` file, and the required dependencies.

### **Step 2: Install Dependencies**

npm i

The `npx` command already installs the dependencies during project creation. Run this step only if the initial installation failed.

### **Step 3: Configure Your Gemini API Key**

1. Visit [https\://aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with your Google account.  
2. Click **Create API Key** and copy the generated key.  
3. Open the `.env` file in your project directory and add your key:

GEMINI\_API\_KEY=your\_key\_here

You can also configure the following optional settings:

| Setting | Description |
| ----- | ----- |
| `GEMINI_MODEL` | Specifies which Gemini model to use. The default is `gemini-flash-latest`. |
| `WALLET_PRIVATE_KEY` | Allows you to use an existing test wallet instead of creating one through the Setup panel. |

### **Step 4: Run the Application**

Start the development server:

npm run dev

Open [http\://localhost:3000](http://localhost:3000/) in your browser.

### **Step 5: Create Your Agent's Wallet**

Click **Create Wallet** in the Setup panel.

Your agent's wallet is saved in `.agent-wallet.json`, allowing it to persist across application restarts.

The Setup panel displays the wallet address, its balance on Base Sepolia, a free test network, and links to the block explorer and test ETH faucets.

### **Step 6: Chat With Your Agent**

Try the following prompts:

| Prompt | What Happens |
| ----- | ----- |
| What's the weather in Mumbai? | The agent accesses a paid API and signs the required payment using its wallet. |
| What's in your wallet? | The agent retrieves its wallet address and balance. |
| Roll a 20 sided dice. | The agent executes a simple tool that does not require payment. |

Click any tool entry in the chat to inspect exactly what the agent sent and received.

Click **Clear** to start a new conversation.

## **Project Structure**

| File | Purpose |
| ----- | ----- |
| `agent/tools.ts` | Defines the agent's tools. This is the primary file you will customize. |
| `agent/wallet.ts` | Handles the agent's wallet operations. |
| `agent/agent.ts` | Contains the agent loop and system prompt. |
| `app/api/weather/route.ts` | Implements the mock paid API. |
| `.env` | Stores your API key and configuration. |
| `.agent-wallet.json` | Stores the agent's wallet information. Never share this file. |

## **Add Your Own Tool**

Open `agent/tools.ts` and add the following object inside the existing `tools` list.

### **Example: Random Joke Tool**

{  
  name: "get\_joke",  
  description: "Get a random joke. Use when the user wants a joke.",  
  parameters: {  
    type: "object",  
    properties: {}  
  },  
  run: async () \=\> {  
    const res \= await fetch(  
      "https\://official-joke-api.appspot.com/random\_joke"  
    );

    return res.json();  
  },  
},

Save the file and refresh the application.

Now ask your agent:

Tell me a joke.

### **Example: A Tool With Inputs**

The following tool retrieves information about a country.

{  
  name: "get\_country\_info",  
  description: "Get facts about a country, including its capital and population.",  
  parameters: {  
    type: "object",  
    properties: {  
      country: {  
        type: "string",  
        description: "Country name, e.g. India"  
      },  
    },  
    required: \["country"\],  
  },  
  run: async ({ country }) \=\> {  
    const res \= await fetch(  
      \`https\://restcountries.com/v3.1/name/\${encodeURIComponent(country)}\`  
    );

    const \[data\] \= await res.json();

    return {  
      capital: data.capital?.\[0\],  
      population: data.population,  
      region: data.region,  
    };  
  },  
},

Try asking:

What's the capital of Japan?

## **Understanding the Four Parts of a Tool**

| Part | What It Does |
| ----- | ----- |
| `name` | A unique identifier for the tool, such as `get_joke`. |
| `description` | Tells Gemini when to use the tool. Be specific. |
| `parameters` | Defines the required inputs. Gemini fills them in based on the user's request. |
| `run` | Contains the function that executes. Its return value is passed back to Gemini. |

## **Paid APIs With x402**

The agent's wallet can automatically handle API payments using the `payAndFetch` helper.

run: async ({ city }, { baseUrl }) \=\>  
  payAndFetch(  
    \`$baseUrl/api/weather?city=${encodeURIComponent(city)}\`  
  ),

### **How It Works**

1. The agent sends a request to the API.  
2. The API responds with `402 Payment Required` and provides the payment details.  
3. The agent's wallet signs the required payment.  
4. The agent sends another request with the signed payment.  
5. The API verifies the payment and returns the requested data.

To create your own paid API, use `app/api/weather/route.ts` as a reference and modify the pricing and response data.

**Security Note:** Payments in this starter template are signed test payments and do not transfer real funds. Use test wallets only.

## **Customize Your Agent's Personality**

Open `agent/agent.ts` and locate `SYSTEM_PROMPT`.

Modify the prompt to give your agent a different role, tone, or set of instructions.

For example:

You are a travel assistant. Always suggest one local food to try.

## **Troubleshooting**

| Problem | Solution |
| ----- | ----- |
| The page says the API key is missing. | Add your key to `.env` and restart the application using `npm run dev`. |
| The agent ignores my tool. | Make the tool description more specific, then restart the application. |
| The application says "No wallet yet". | Click **Create Wallet** in the Setup panel. |
| Port 3000 is already in use. | Run `npm run dev -- -p 3001` and open [http\://localhost:3001](http://localhost:3001/). |
| A model error appears in the chat. | Verify your API key or configure a different `GEMINI_MODEL` in `.env`. |

