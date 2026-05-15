type MessageContentPart = { text?: string | null } | string | null | undefined;

type MessageContent = MessageContentPart | MessageContentPart[];

export function messageContentToString(content: MessageContent) {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    let text = "";
    for (const part of content) {
      if (typeof part === "string") {
        text += part;
        continue;
      }
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        text += part.text;
      }
    }
    return text;
  }

  if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
    return content.text;
  }

  return "";
}
