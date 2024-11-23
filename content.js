import { APIKEY, ASSISTANT_ID } from "./config.js";

const TEST_MESSAGE = `Hi Faith,
After further testing, I’ve confirmed that this issue isn’t limited to your web application but occurs in others as well, which suggests it’s likely a bug.
I’ve submitted a bug ticket and notified our development team about the issue.
As I work with them and receive updates, I’ll be sure to keep you in the loop.
Thank you for your patience as we work through this!
Best,`;

class OpenAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
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

  async createAndStreamRun(threadId) {
    const url = `${this.baseUrl}/threads/${threadId}/runs`;

    const response = await fetch(url, {
      method: "POST",
      headers: { ...this.headers, Accept: "text/event-stream" },
      body: JSON.stringify({ assistant_id: ASSISTANT_ID, stream: true }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      console.log("SSE chunk received:", chunk);
      // Parse and handle each SSE event chunk as needed
    }

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

const openAI = new OpenAI(APIKEY);
const sendTestMessage = async () => {
  const thread = await openAI.createThread();
  console.log({ thread });
  const threadId = thread.id;

  if (!threadId) {
    console.log("Thread ID not found");
    return;
  }

  await openAI.addMessageToThread(threadId, TEST_MESSAGE);
  await openAI.createAndStreamRun(threadId);
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
  "#outerContainer > div.slds-form-element.lightningInputRichText.forceChatterMessageBodyInputRichTextEditor > div > div.slds-rich-text-editor__textarea.slds-grid.ql-container > div.ql-editor.ql-blank.slds-rich-text-area__content.slds-text-color_weak.slds-grow > p > br";
const postEditorBr = () => document.querySelector(postEditorBrSelector);

const insertTextIntoPostEditor = (text) => {
  const editor = postEditorBr()?.parentElement;
  if (editor) {
    editor.textContent = text;
  }
};

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

  const editor = postEditorBrResult?.parentElement;
  if (editor) {
    editor.textContent = "Hello World";
  }

  await sendTestMessage();

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
