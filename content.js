class OpenAI {
  constructor() {
    this.apiKey = null;
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
        assistant_id: null,
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedDate = `<p><strong>[${month}/${day}]</strong></p>`;
    element.innerHTML = formattedDate;
    let accumulatedText = "";
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
                element.innerHTML =
                  formattedDate +
                  accumulatedText
                    .split("\n")
                    .map((txt) => `<p>${txt}</p>`)
                    .join("");
              }
            } catch (error) {
              console.error("Failed to parse JSON data:", error);
            }
          }
        }
      }
    }
    console.log("Final accumulated text:", { accumulatedText });
  }
}

const openAI = new OpenAI();
const sendTestMessage = async (element, emailContent) => {
  const thread = await openAI.createThread();
  const threadId = thread.id;

  if (!threadId) {
    console.log("Thread ID not found");
    return;
  }

  await openAI.addMessageToThread(threadId, emailContent);
  await openAI.createAndStreamRun(threadId, element);
};

const composeBtn = '.slds-button--brand[title="Compose"]';
const sendBtn = ".cuf-publisherShareButton";
const postTab =
  "flexipage-component2 > slot > flexipage-aura-wrapper > div > div > div.MEDIUM.uiTabset--base.uiTabset--task.uiTabset.oneActionsComposer.forceActionsContainer > div > ul > li:nth-child(3) > a";
const postEditorBr =
  "#outerContainer > div.slds-form-element.lightningInputRichText.forceChatterMessageBodyInputRichTextEditor > div > div.slds-rich-text-editor__textarea.slds-grid.ql-container > div.ql-editor.ql-blank.slds-rich-text-area__content.slds-text-color_weak.slds-grow";
const latestEmail = "#emailuiFrame";

const getElement = (documentQuery) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const element = document.querySelector(documentQuery);
      if (!element) return;
      observer.disconnect();
      resolve(element);
    });

    observer.observe(document.body, { childList: true, subtree: true });
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

const createPostButton = async () => {
  const viewport = await getElement(
    "body > div.desktop.container.forceStyle.oneOne.navexDesktopLayoutContainer.lafAppLayoutHost.forceAccess > div.viewport"
  );
  if (!viewport) return;

  const postButton = document.createElement("button");
  const postTabLink = await getElement(postTab);
  console.log({ postTabLink });

  postButton.innerText = "Create Post";
  postButton.style.backgroundColor = postButton ? "rgb(108, 76, 153)" : "grey";
  postButton.style.color = "white";
  postButton.style.padding = "10px 16px";
  postButton.style.textAlign = "center";
  postButton.style.fontSize = "13px";
  postButton.style.border = "none";
  postButton.style.borderRadius = "5px";
  postButton.style.cursor = "pointer";
  postButton.style.position = "fixed";
  postButton.style.bottom = "5px";
  postButton.style.right = "5px";

  viewport.appendChild(postButton);

  if (!postTabLink) {
    console.log("Post tab not found");
    return;
  }

  postButton.addEventListener("click", async () => {
    postTabLink.click();
    const postEditorBrResult = await getElement(postEditorBr);
    if (!postEditorBrResult) {
      console.log("Post editor not found");
      return;
    }

    const emailIframe = await getElement(latestEmail);
    if (!emailIframe) {
      console.log("Iframe not found");
      return;
    }

    const emailContent = emailIframe.contentWindow.document.body.textContent
      .trim()
      .split("Vasion.com; \n + 1 435.652.1288")[0];

    await sendTestMessage(postEditorBrResult, emailContent);
  });
};

// Re-run the `examinePage` logic whenever a page change occurs (detecting both navigation and page load).
const handlePageChange = async () => {
  await createPostButton();
};

handlePageChange();
window.addEventListener("popstate", handlePageChange);
document.addEventListener("DOMContentLoaded", handlePageChange);

// const observeUrlChange = () => {
//   let lastUrl = window.location.pathname;

//   const observer = new MutationObserver(() => {
//     const currentUrl = window.location.pathname;
//     if (currentUrl !== lastUrl) {
//       lastUrl = currentUrl;
//       handleUrlChange();
//     }
//   });

//   observer.observe(document.body, { childList: true, subtree: true });
// };

// observeUrlChange();

// const handleUrlChange = () => {
//   const caseUrlPattern = /lightning\/r\/Case\/\w+\/view/;
//   const currentUrl = window.location.href;
//   console.log("Checking URL:", currentUrl);

//   const isCaseUrl = caseUrlPattern.test(currentUrl);
//   console.log("Regex Match:", isCaseUrl);

//   if (isCaseUrl) {
//     console.log("Case URL detected, triggering examinePage()");
//     examinePage();
//   } else {
//     console.log("Not a case URL");
//   }
// };

// handleUrlChange();
