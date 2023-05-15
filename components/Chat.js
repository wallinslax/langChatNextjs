import { useState, useEffect } from "react";

export default function Chat() {
  const [newMessage, setNewMessage] = useState({ role: "ai", message: "" });
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [finished, setFinished] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "human",
      message: "Please load 'state_of_the_union.txt' before answer me 👋. ",
    },
    {
      role: "ai",
      message:
        "🤖 beep boop. 100% loading completed. Ask me: What did the president say about Justice Breyer?",
    },
  ]);

  useEffect(() => {
    // console.log("update messages");
    if (newMessage.message) {
      setMessages((prevMsgs) => [...prevMsgs, newMessage]);
      setNewMessage({ role: "ai", message: "" });
    }
  }, [finished]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFinished(false);
    setMessages((prev) => [...prev, { role: "human", message: input }]);
    console.log("user prompt=", input);

    const response = await fetch("/api/docQA", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: input, // "Where did Harrison go to college?"
        history: [],
      }),
    });
    const data = await response.json(); // data = { text: ' Harrison went to Harvard.' }
    setInput("");

    try {
      setNewMessage({ role: "ai", message: data.text });
    } catch (error) {
      console.error("error=", error);
    } finally {
      setFinished(true);
    }
  };

  return (
    <div className="bg-slate-100">
      <div className="mx-auto max-w-[1000px] flex flex-col h-screen bg-white">
        <div className="flex-grow overflow-y-auto p-4">
          <div className="flex flex-col">
            {messages.map((message, index) => {
              return (
                <div
                  key={index}
                  className={`flex ${
                    message.role !== "ai" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      message.role !== "ai"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }  text-2xl p-2 rounded-md mb-2 max-w-sm`}
                  >
                    {message.message}
                  </div>
                </div>
              );
            })}

            {!finished && (
              <div className="flex justify-start bg-gray-200 text-2xl p-2 rounded-md mb-2 max-w-sm">
                {"thinking..."}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-none p-6">
          <div className="flex flex-col rounded-lg">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              maxLength={200}
              className="w-full rounded-sm border
         p-4 text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none"
              placeholder={"Ask a question"}
            />

            {finished ? (
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-500 rounded-md mt-2 px-4 py-2 text-white font-semibold focus:outline-none text-xl"
                type="submit"
              >
                Submit
              </button>
            ) : (
              <button disabled className="w-full">
                <div className="animate-pulse font-bold">Thinking</div>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
