const TEST_MESSAGE = `Hi Faith,
After further testing, I’ve confirmed that this issue isn’t limited to your web application but occurs in others as well, which suggests it’s likely a bug.
I’ve submitted a bug ticket and notified our development team about the issue.
As I work with them and receive updates, I’ll be sure to keep you in the loop.
Thank you for your patience as we work through this!
Best,`;

let POST_EDITOR_ELEMENT = null;

class OpenAI {
  constructor() {
    this.apiKey =""
    this.baseUrl = "https://api.openai.com/v1";
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "OpenAI-Beta": "assistants=v2",
    };
  }

  async createAssistant(data) {
    const response = await fetch(`${this.baseUrl}/assistants`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async createThread() {
    const response = await fetch(`${this.baseUrl}/threads`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({}),
    });
    return await response.json();
  }

  async addMessageToThread(threadId, message) {
    const response = await fetch(
      `${this.baseUrl}/threads/${threadId}/messages`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ role: "user", content: message }),
      }
    );
    return await response.json();
  }

  async createAndStreamRun(threadId, element) {
    const url = `${this.baseUrl}/threads/${threadId}/runs`;

    const response = await fetch(url, {
      method: "POST",
      headers: { ...this.headers, Accept: "text/event-stream" },
      body: JSON.stringify({
        assistant_id: "",
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const today = new Date();
const month = today.getMonth() + 1; // getMonth() returns 0-based month
const day = today.getDate();
const formattedDate = `<p><strong>[${month}/${day}]</strong></p>`;

element.innerHTML = formattedDate; // Set the initial date at the top

let accumulatedText = ""; // To store the dynamic text content
const reader = response.body.getReader();
const decoder = new TextDecoder("utf-8");

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  console.log({ chunk });

  const events = chunk.split("\n\n");

  for (const event of events) {
    if (event.startsWith("event: thread.message.delta")) {
      const dataIndex = event.indexOf("data: ");
      if (dataIndex !== -1) {
        const jsonData = event.substring(dataIndex + 6);
        try {
          const parsedData = JSON.parse(jsonData);
          const content = parsedData.delta.content;
          for (const item of content) {
            if (item.type !== "text") continue;
            accumulatedText += item.text.value;
            // Ensure date always stays above the dynamic content
            element.innerHTML = formattedDate + accumulatedText.split("\n").map((txt) => `<p>${txt}</p>`).join('');
          }
        } catch (error) {
          console.error("Failed to parse JSON data:", error);
        }
      }
    }
  }
}



    // const today = new Date();
    // const month = today.getMonth() + 1; // getMonth() returns 0-based month
    // const day = today.getDate();
    // const formattedDate = `<p><strong>[${month}/${day}]</strong></p>`;
    // element.innerHTML = formattedDate
    // let accumulatedText = "";
    // const reader = response.body.getReader();
    // const decoder = new TextDecoder("utf-8");

    // while (true) {
    //   const { value, done } = await reader.read();
    //   if (done) break;

    //   const chunk = decoder.decode(value, { stream: true });
    //   console.log({ chunk });

    //   const events = chunk.split("\n\n");

    //   for (const event of events) {
    //     if (event.startsWith("event: thread.message.delta")) {
    //       const dataIndex = event.indexOf("data: ");
    //       if (dataIndex !== -1) {
    //         const jsonData = event.substring(dataIndex + 6);
    //         try {
    //           const parsedData = JSON.parse(jsonData);
    //           const content = parsedData.delta.content;
    //           for (const item of content) {
    //             if (item.type !== "text") continue;
    //             accumulatedText += item.text.value;;
    //             element.innerText = accumulatedText;
    //           }
    //         } catch (error) {
    //           console.error("Failed to parse JSON data:", error);
    //         }
    //       }
    //     }
    //   }
    // }

    console.log("Final accumulated text:", { accumulatedText });
    // const reader = response.body.getReader();
    // const decoder = new TextDecoder("utf-8");

    // let accumulatedText = "Hello World,";

    // while (true) {`
    //   const { value, done } = await reader.read();
    //   if (done) break;

    //   const chunk = decoder.decode(value, { stream: true });
    //   console.log({ chunk });

    //   if (chunk.includes("textDelta")) {

    //   if (element) {
    //     element.textContent = accumulatedText;
    //   }

    //   // Parse and handle each SSE event chunk as needed
    // }
    // console.log("Final accumulated text:", accumulatedText);
    // while (true) {
    //   const { value, done } = await reader.read();
    //   if (done) break;

    //   const chunk = decoder.decode(value, { stream: true });
    //   const text = chunk.data.value;
    //   console.log("SSE chunk received:", { text });
    //   // Parse and handle each SSE event chunk as needed
    // }

    // Open the EventSource connection for SSE
    // const eventSource = new EventSource(url);

    // console.log("EventSource created:", eventSource);

    // eventSource.onmessage = (event) => {
    //   try {
    //     const data = JSON.parse(event.data); // Parse each event's data as JSON
    //     console.log("Received event:", data);

    //     if (data.type === "textCreated") {
    //       console.log("\nassistant > ");
    //     } else if (data.type === "textDelta") {
    //       console.log(data.textDelta.value);
    //     } else if (data.type === "toolCallCreated") {
    //       console.log(`\nassistant > ${data.toolCall.type}\n\n`);
    //     } else if (data.type === "toolCallDelta") {
    //       if (data.toolCallDelta.type === "code_interpreter") {
    //         if (data.toolCallDelta.code_interpreter.input) {
    //           console.log(data.toolCallDelta.code_interpreter.input);
    //         }
    //         if (data.toolCallDelta.code_interpreter.outputs) {
    //           console.log("\noutput >\n");
    //           data.toolCallDelta.code_interpreter.outputs.forEach((output) => {
    //             if (output.type === "logs") {
    //               console.log(`\n${output.logs}\n`);
    //             }
    //           });
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error parsing event data:", error);
    //   }
    // };

    // eventSource.onerror = (error) => {
    //   console.error("Error receiving SSE data:", error);
    //   eventSource.close();
    // };
  }
}

const openAI = new OpenAI();
const sendTestMessage = async (element) => {
  const thread = await openAI.createThread();
  console.log({ thread });
  const threadId = thread.id;

  if (!threadId) {
    console.log("Thread ID not found");
    return;
  }

  await openAI.addMessageToThread(threadId, TEST_MESSAGE);
  await openAI.createAndStreamRun(threadId, element);
};

const composeBtnSelector = '.slds-button--brand[title="Compose"]';
const sendBtnSelector = ".cuf-publisherShareButton";
const emailBodySelector = 'body[aria-label="Email Body"][role="textbox"]';
const composeButton = () => document.querySelector(composeBtnSelector);
const sendButton = () => document.querySelector(sendBtnSelector);
const emailBody = () => document.querySelector(emailBodySelector);
const iframeSelector = ".cke_wysiwyg_frame.cke_reset";
const iframeElement = () => document.querySelector(iframeSelector);
const postTabSelector =
  "#tab-4 > slot > flexipage-component2 > slot > flexipage-aura-wrapper > div > div > div.MEDIUM.uiTabset--base.uiTabset--task.uiTabset.oneActionsComposer.forceActionsContainer > div > ul > li:nth-child(3) > a";
const postTab = () => document.querySelector(postTabSelector);

const postEditorBrSelector =
  "#outerContainer > div.slds-form-element.lightningInputRichText.forceChatterMessageBodyInputRichTextEditor > div > div.slds-rich-text-editor__textarea.slds-grid.ql-container > div.ql-editor.ql-blank.slds-rich-text-area__content.slds-text-color_weak.slds-grow";
const postEditorBr = () => document.querySelector(postEditorBrSelector);

const currentUrl = window.location.href;
const caseUrlPattern = /lightning\/r\/Case\/[a-zA-Z0-9]+\/view/;
const isCaseUrl = caseUrlPattern.test(currentUrl);

const getElement = (findElement) => {
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      const tempElement = findElement();
      if (tempElement) {
        clearInterval(intervalId);
        resolve(tempElement);
      }
    }, 1000);
  });
};

const waitForBtnClick = async (btn) => {
  return new Promise((resolve) => {
    btn.addEventListener("click", () => {
      console.log("Internal compose button clicked");
      resolve(true);
    });
  });
};

const waitForSendBtn = async (sendBtn) => {
  return new Promise((resolve) => {
    sendBtn.addEventListener("mouseover", () => {
      resolve(true);
    });
  });
};

const examinePage = async () => {
  console.log({ isCaseUrl });
  if (!isCaseUrl) return;

  const composeBtn = await getElement(composeButton);
  if (!composeBtn) {
    console.log("Compose button not found");
    return;
  }

  const clickedComposeBtn = await waitForBtnClick(composeBtn);
  console.log({ clickedComposeBtn });

  if (!clickedComposeBtn) return;

  const postTabLink = await getElement(postTab);
  console.log({ postTabLink });
  if (!postTabLink) {
    console.log("Post tab not found");
    return;
  }

  postTabLink.click();
  const postEditorBrResult = await getElement(postEditorBr);
  if (!postEditorBrResult) {
    console.log("Post editor not found");
    return;
  }

  await sendTestMessage(postEditorBrResult);

  // setTimeout(() => {
  //   insertTextIntoPostEditor("hi test");
  // }, 2000);

  return;

  const sendBtn = await getElement(sendButton);
  if (!sendBtn) return;

  const sendButtonClicked = await waitForBtnClick(sendBtn);
  console.log({ sendButtonClicked });
  if (!sendButtonClicked) return;

  let emailContent = "";
  setTimeout(() => {
    const content = getEmailContent();
    if (!content) {
      return;
    }
    emailContent = content;
  }, 6000);

  if (!emailContent) return;
};

examinePage();

const getEmailContent = () => {
  const EMAIL_SELECTORS = [
    "#emailuiFrame",
    ".email-content",
    ".message-content",
    '[role="main"]',
    "#message-content",
    ".email-body",
  ];

  for (const selector of EMAIL_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      let content = "";

      if (element.tagName === "IFRAME") {
        try {
          content =
            element.contentDocument?.body?.textContent ||
            element.contentWindow?.document?.body?.textContent;
        } catch (e) {
          console.log("Cannot access iframe content:", e);
        }
      } else {
        content = element.textContent;
      }

      if (content && content.trim()) {
        return content.trim();
      }
    }
  }
  return null;
};
