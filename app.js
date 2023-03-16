const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.querySelector('.chat-input input[type="text"]');
const sendButton = document.querySelector(".chat-input button");
let chatHistory = [];

var key

//每次进入页面弹出输入框输入密码然后获取打印
getPass();
function getPass() {
  key = prompt("请输入您的key", "");
  //判断密码是不是sk开头的是就正确
  if (key.substring(0, 2) == "sk") {
    // alert("密码正确");
  } else {
    // console.log(password.substring(0, 2));
    alert("密钥错误");
    getPass();
  }
  // console.log(key);
}

// console.log(key);
chatInput.addEventListener("keydown", (event) => {
  const message = chatInput.value.trim();
  if (event.key === "Enter") {
    if (message !== "") {
      sendButton.disabled = true; // 禁用 Send 按钮
      sendButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>'; // 显示 loading 动画
      sendMessage(message);
      chatInput.value = "";
    }
  }
});
// console.log(key);
sendButton.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message !== "") {
    sendButton.disabled = true; // 禁用 Send 按钮
    sendButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>'; // 显示 loading 动画
    sendMessage(message);
    chatInput.value = "";
  } else {
    alert("请输入内容");
  }
});
// console.log(key);
function sendMessage(message) {
  const date = new Date();
  const timestamp = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Append the message to the chat history
  chatHistory.push({ type: "q", message });

  // If the chat history is longer than 5 messages, remove the oldest message
  if (chatHistory.length > 5) {
    chatHistory.shift();
  }

  const formattedHistory = chatHistory
    .map(({ type, message }) => `${type}: ${message}`)
    .join("\n");
  const messageHTML = `
    <p style="color:green;margin:20px 0;padding: 10px" class="shad">
      <strong>You:</strong> ${message}
      <span class="message-time">${timestamp}</span>
    </p>
  `;
  chatMessages.insertAdjacentHTML("beforeend", messageHTML);

  // Call the OpenAI Chat API to get the response
  callOpenAIChatAPI(formattedHistory)
    .then((response) => {
      const botMessage = response.choices[0].message.content;
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Append the bot's response to the chat history
      chatHistory.push({ type: "a", message: botMessage.slice(5) });

      // If the chat history is longer than 5 messages, remove the oldest message
      if (chatHistory.length > 5) {
        chatHistory.shift();
      }

      const formattedHistory = chatHistory
        .map(({ type, message }) => `${type}: ${message}`)
        .join("\n");
      console.log(botMessage);
      // let result = botMessage.replace(/a:/gi, '').replace(/```([\s\S]*?)```/g, function(match, p1) {
      //     // 使用CSS样式设置代码块的样式
      //     return '<pre>' + p1 + '</pre>';
      //   });

      let result = botMessage
        .replace(/a:/gi, "")
        .replace(/```(\w+)\n([\s\S]*?)```/g, function (match, p1, p2) {
          console.log("p1==>", p1);
          console.log("p2==>", p2);
          let className = "";
          if (p1 === "js" || p1 === "javascript") {
            // className = "js-code";
            p2 = hljs.highlight("javascript", p2).value;
          } else if (p1 === "json") {
            p2 = hljs.highlight("json", p2).value;
            // className = "json-code";
          } else if (p1 === "html") {
            // className = "html-code";
            p2 = hljs.highlight("html", p2).value;
          } else if (p1 === "css") {
            // className = "css-code";
            p2 = hljs.highlight("css", p2).value;
          } else if (p1 === "python") {
            p2 = hljs.highlight("python", p2).value;
            // className = "python-code";
          } else if (p1 === "java") {
            p2 = hljs.highlight("java", p2).value;
            // className = "java-code";
          } else if (p1 === "bash") {
            p2 = hljs.highlight("bash", p2).value;
            // className = "bash-code";
          } else {
            p2 = hljs.highlight("javascript", p2).value;
          }

          // 使用 CSS 样式设置代码块的样式
          return `<pre class="${className} hljs">${p2}</pre>`;
        });

      const responseHTML = `
        <p class="shad" style="padding: 10px">
          <strong>ChatGPT:</strong><span style="white-space:pre-line;">${result}</span>
          <span class="message-time"><br>${timestamp}</span>
        </p>
      `;
      chatMessages.insertAdjacentHTML("beforeend", responseHTML);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatMessages.lastElementChild.scrollIntoView();
      // 隐藏 loading 动画并启用 Send 按钮
      sendButton.disabled = false;
      sendButton.innerHTML = "Send";
    })
    .catch((error) => {
      console.error(error);
      // 隐藏 loading 动画并启用 Send 按钮
      sendButton.disabled = false;
      sendButton.innerHTML = "Send";
      alert("超时!请重新发送");
    });
}
// console.log(key);

function callOpenAIChatAPI(message) {
  // console.log(key);
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };

  // fetch(url, {
  //   method: "POST",
  //   headers: headers,
  //   body: JSON.stringify(data),
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     return response.json();
  //   })
  //   .then((data) => {
  //     console.log(data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error);
  //   });

  // const apiUrl = "http://192.168.101.157:5001/openai_chat";
  // const formData = new FormData();
  // formData.append("message", message);

  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${message}` }],
  };

  return fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => response)
    .catch((error) => {
      console.error("Error:", error);
    });
}

