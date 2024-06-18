const { AzureOpenAiEmbedder } = require("../../EmbeddingEngines/azureOpenAi");
const {
  writeResponseChunk,
  clientAbortedHandler,
  handleDefaultStreamResponseV2
} = require("../../helpers/chat/responses");

const { OpenAI } = require("openai");

class AzureML {
  constructor(embedder = null, _modelPreference = null) {
    const { OpenAI: OpenAIApi } = require("openai");
    if (!process.env.AZURE_ML_ENDPOINT)
      throw new Error("No Azure API endpoint was set.");
    if (!process.env.AZURE_ML_KEY)
      throw new Error("No Azure API key was set.");

    this.openai = new OpenAIApi({
      baseURL: process.env.AZURE_ML_ENDPOINT,
      apiKey: process.env.AZURE_ML_KEY ?? null,
    });
    this.model = process.env.AZURE_ML_DEPLOYMENT;
    this.limits = {
      history: this.promptWindowLimit() * 0.15,
      system: this.promptWindowLimit() * 0.15,
      user: this.promptWindowLimit() * 0.7,
    };

    if (!embedder)
      console.warn(
        "No embedding provider defined for AzureOpenAiLLM - falling back to AzureOpenAiEmbedder for embedding!"
      );
    this.embedder = !embedder ? new AzureOpenAiEmbedder() : embedder;
    this.defaultTemp = 0.7;
  }

  #appendContext(contextTexts = []) {
    if (!contextTexts || !contextTexts.length) return "";
    return (
      "\nContext:\n" +
      contextTexts
        .map((text, i) => {
          return `[CONTEXT ${i}]:\n${text}\n[END CONTEXT ${i}]\n\n`;
        })
        .join("")
    );
  }

  streamingEnabled() {
    return "streamGetChatCompletion" in this;
  }

  // Sure the user selected a proper value for the token limit
  // could be any of these https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-4-models
  // and if undefined - assume it is the lowest end.
  promptWindowLimit() {
    return !!process.env.AZURE_OPENAI_TOKEN_LIMIT
      ? Number(process.env.AZURE_OPENAI_TOKEN_LIMIT)
      : 4096;
  }

  isValidChatCompletionModel(_modelName = "") {
    // The Azure user names their "models" as deployments and they can be any name
    // so we rely on the user to put in the correct deployment as only they would
    // know it.
    return true;
  }

  constructPrompt({
    systemPrompt = "",
    contextTexts = [],
    chatHistory = [],
    userPrompt = "",
  }) {
    const prompt = {
      role: "system",
      content: `${systemPrompt}${this.#appendContext(contextTexts)}`,
    };
    return [prompt, ...chatHistory, { role: "user", content: userPrompt }];
  }

  async isSafe(_input = "") {
    // Not implemented by Azure OpenAI so must be stubbed
    return { safe: true, reasons: [] };
  }

  async getChatCompletion(messages = [], { temperature = 0.7 }) {
    const client = new OpenAI({
      apiKey: process.env.AZURE_ML_KEY,
      baseURL: process.env.AZURE_ML_ENDPOINT,
    });

    var system_message = messages.shift();

    messages[0].content = system_message.content + messages[0].content;
    //Sends message via POST http://127.0.0.1:8000/ in the form of JSON
    // var response = await fetch("http://192.168.31.82:8000", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(messages),
    // });

    const completion = await client.chat.completions.create({
      messages: messages,
      model: "mistralai-mistral-7b-instruct",
      max_tokens: 16384,
    });

    // const result = await this.openai.chat.completions.create({
    //   model: "mistralai-mistral-7b-instruct-2",
    //   messages,
    //   temperature,
    // });

    return completion.choices[0].message.content;
  }

  // Simple wrapper for dynamic embedder & normalize interface for all LLM implementations
  async embedTextInput(textInput) {
    return await this.embedder.embedTextInput(textInput);
  }
  async embedChunks(textChunks = []) {
    return await this.embedder.embedChunks(textChunks);
  }

  async compressMessages(promptArgs = {}, rawHistory = []) {
    const { messageArrayCompressor } = require("../../helpers/chat");
    const messageArray = this.constructPrompt(promptArgs);
    return await messageArrayCompressor(this, messageArray, rawHistory);
  }
}

module.exports = {
  AzureML,
};
