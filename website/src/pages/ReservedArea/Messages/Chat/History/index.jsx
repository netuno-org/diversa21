import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

// import _ws from "@netuno/ws-client";

import Message from "./Message/index.jsx";
import "./index.less";

// Placeholder values
const MOCK_MESSAGES = [
  { uid: "m1", text: "Olá! Tudo bem?", from: "friend", time: "10:00" },
  { uid: "m2", text: "Tudo ótimo! E contigo?", from: "me", time: "10:05" },
  { uid: "m3", text: "Também!", from: "friend", time: "10:06" },
  { uid: "m4", text: "Que bom!", from: "me", time: "10:08" },
  { uid: "m5", text: "Que tens feito?", from: "friend", time: "10:10" },
  { uid: "m6", text: "Nada e tu?", from: "me", time: "10:15" },
  { uid: "m7", text: "Nada", from: "friend", time: "10:16" },
];

function History({ friend, reload }) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const refList = useRef(null);

  useEffect(() => {
    // Simulated loading
    setLoading(true);
    const timer = setTimeout(() => {
      const chatData = MOCK_MESSAGES.map(msg => ({
        ...msg,
        from: msg.from === "friend" ? friend.uid : "me"
      }));

      setMessages(chatData);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);

    // const listenerMessageRef = _ws.addListener({
    //   method: "POST",
    //   service: "message/list",
    //   success: (data) => {
    //     setLoading(false);
    //     setMessages(data.content);
    //   },
    //   fail: (error) => {
    //     setLoading(false);
    //   }
    // });
    // onLoad();
    // return () => {
    //   _ws.removeListener(listenerMessageRef);
    // }
  }, [friend]);

  useEffect(() => {
    if (reload > 0) {
      setMessages((prev) => [
        ...prev,
        { uid: `new-${Date.now()}`, text: "Nova mensagem enviada (Teste)!", from: "me", time: "Agora" }
      ]);
      // onLoad();
    }
  }, [reload]);

  useEffect(() => {
    if (refList.current) {
      refList.current.scrollTo({ top: refList.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // const onLoad = () => {
  //   _ws.sendService({
  //     method: "POST",
  //     service: "message/list",
  //     data: {
  //       with: friend.uid
  //     }
  //   });
  // };

  return (
    <div className="messages__history-wrapper" ref={refList}>
      {loading && (
        <div className="messages__history-loading">
          <Spin />
        </div>
      )}

      {!loading && (
        <ul className="messages__history-list">
          {messages.map((message) => (
            <Message key={message.uid} friend={friend} data={message} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;