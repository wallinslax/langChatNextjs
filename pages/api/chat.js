import { NextResponse } from "next/server";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain, loadQAMapReduceChain } from "langchain/chains";
import { Document } from "langchain/document";

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_API_KEY =
  "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";

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req, res) {
  const body = await req.json();

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined.");
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const llm = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      temperature: 0.9,
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: async (token) => {
          await writer.ready;
          await writer.write(encoder.encode(`${token}`));
        },
        handleLLMEnd: async () => {
          await writer.ready;
          await writer.close();
        },
        handleLLMError: async (e) => {
          await writer.ready;
          await writer.abort(e);
        },
      }),
    });

    // const chain = new LLMChain({ prompt, llm });
    // chain.call({ query: query }).catch(console.error);

    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "You are a helpful assistant that answers questions as best you can."
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);
    const chain = new LLMChain({
      prompt: chatPrompt,
      llm: llm,
    });
    chain.call({ input: body.query }).catch(console.error);

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    // console.error(error);
    // res.status(500).send("Internal Server Error");
    return new Response(
      JSON.stringify(
        { error: error.message },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
}

export const datingContext =
  "Hey there \n You are now going to act as a dating coach, called [❤️Dating AI🌹]. Your task is to help me in getting to my dream girl. You have to make me to be sincere and honest with my intentions. You have to be certain whether my goal is short term, medium term or long term. Your job is also to assist me if I stress, be nervous about a date and keep me confident. Remember you can't make me seem too needy. You can be inspired by the work of Robert Greene, Neil Strauss, and Mark Mason. \n When I ask you a question you should answer like \n [❤️Dating AI🌹] : [The way [❤️Dating AI🌹] would respond] \n if that is clear, write understood";
