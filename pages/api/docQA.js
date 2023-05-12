import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain, loadQAMapReduceChain } from "langchain/chains";
import { Document } from "langchain/document";
import { OPENAI_API_KEY } from "@/pages/api/chat";

export default async function handler(req, res) {
  const body = req.body;
  //------------------------------------------------
  // https://docs.langchain.com/docs/use-cases/qa-docs
  // https://js.langchain.com/docs/modules/chains/index_related_chains/document_qa
  // This first example uses the `StuffDocumentsChain`.
  const llmA = new OpenAI({
    openAIApiKey: OPENAI_API_KEY,
    temperature: 0.9,
  });
  const chainA = loadQAStuffChain(llmA);
  const docs = [
    new Document({ pageContent: "Harrison went to Harvard." }),
    new Document({ pageContent: "Ankush went to Princeton." }),
  ];
  const resA = await chainA
    .call({
      input_documents: docs,
      question: body.query,
    })
    .catch(console.error);
  console.log({ resA });
  //------------------------------------------------
  res.status(200).json(resA);
}
