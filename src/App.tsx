import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { ChatMessage } from "./ChatMessage";
import { io } from "socket.io-client";
import { CHAT_SERVER_URL } from "./env.ts";

import "./App.css";

/**
 * Connects to our socket.io chat server.
 *
 * @return
 *   A socket.io client socket
 */
const connectChatServer = () => {
  const socket = io(CHAT_SERVER_URL, {});
  return socket;
};

/**
 * Our main app component.
 */
function App() {
  // An array of our message objects.
  const [messages, setMessages] = useState<any[]>([]);
  // A boolean to toggle color blind mode.
  const [isColorBlindMode, setIsColorBlindMode] = useState<boolean>(false);
  // A string to a message that we are going to send to our chat server.
  const [message, setMessage] = useState<string>("");
  // A ref to chat message container. In this case, it's a `<ul>` element.
  const chatListRef = useRef<HTMLUListElement>(null);

  // Leverage `scrollIntoView()` to scroll to the last message. Called inside
  // our `useEffect()` hook.
  const scrollToLastMessage = () => {
    const lastMessage = chatListRef.current?.lastChild as HTMLLIElement;
    lastMessage.scrollIntoView({
      block: "end",
      inline: "nearest",
      behavior: "smooth",
    });
  };

  /**
   * Sends a message to our chat server.
   *
   * @param message
   */
  const handleSendMessage = (message: string) => {
    console.log("Sending message: ", message);
    const socket = connectChatServer();
    socket.emit(message);
    setMessage("");
  };

  // We call `useEffect()` since we are working with an external API
  // (socket.io). `useEffect()` will connect to our chat server after the
  // component has been mounted. Since we also pass a dependancy array (and do
  // not alter it), `useEffect()` will only run once after the component has
  // been mounted. If we did not pass a dependancy array, the component would
  // call our `useEffect()` after every render.
  useEffect(() => {
    const socket = connectChatServer();

    socket.onAny((type, message) => {
      if (type === "chat-message") {
        // We use `flushSync()` here because we want to ensure that the
        // component has re-rendered completly before we attempt to scroll to
        // the last message (by calling `scrollToLastMessage()`). `flushSync()`
        // ensures that by the time the DOM has been updated, we can scroll to
        // the bottom of the message list by forcing the component to re-render
        // when `flushSync()` is called. This ensures that the latest message is
        // in the DOM before we scroll to it.
        flushSync(() => {
          // We use the spread operator here to ensure that we are not mutating.
          setMessages([
            ...messages,
            // And pass in our new message.
            {
              body: message.body,
              user: message.user,
              time: message.time,
            },
          ]);
        });

        // Now that we've `flushSync()`'d, we can scroll to the last message.
        scrollToLastMessage();
      }
    });

    // If we return a function from `useEffect()`, it will treated as our
    // "cleanup" function. It will be called after the component is unmounted
    // and before the component is re-rendered again.
    return () => {
      // We disconnect from our chat server.
      socket.disconnect();
    };
  }, [messages]);

  return (
    <div className="App">
      <h1>Chat App</h1>
      <label htmlFor="color-blind-mode">Color Blind Mode</label>
      <input
        type="checkbox"
        id="color-blind-mode"
        onChange={(e) => setIsColorBlindMode(e.target.checked)}
      />
      <div />
      <label htmlFor="message-input">Your chat message</label>
      <input
        type="text"
        id="message-input"
        value={message}
        onChange={(event) => {
          if (event.target.value.trim() !== "") {
            setMessage(event.target.value.trim());
          }
        }}
      />
      <button onClick={() => handleSendMessage(message)}>Send Message</button>
      <hr />
      <ul ref={chatListRef}>
        {messages?.map((message, index) => {
          return (
            // We need to be careful when using `index` as our `key` prop. In
            // this case it is OK since we are not mutating the array. If we
            // wanted to mutate the array, we would need to use a unique
            // identifier for each message.
            <li key={index}>
              <ChatMessage
                message={...message}
                isColorBlindMode={isColorBlindMode}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
