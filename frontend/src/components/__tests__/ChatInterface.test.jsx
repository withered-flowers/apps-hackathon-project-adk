import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatInterface from "../ChatInterface";

describe("ChatInterface Markdown Rendering", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders italic text with single asterisks", () => {
    const messages = [
      { role: "assistant", agent: "TestAgent", content: "This is *italic* text" },
    ];
    render(<ChatInterface messages={messages} loading={false} onSend={() => {}} disabled={false} />);
    const italicElement = screen.getByText(/italic/i);
    expect(italicElement.tagName).toBe("EM");
  });

  it("renders bold text with double asterisks", () => {
    const messages = [
      { role: "assistant", agent: "TestAgent", content: "This is **bold** text" },
    ];
    render(<ChatInterface messages={messages} loading={false} onSend={() => {}} disabled={false} />);
    const boldElement = screen.getByText(/bold/i);
    expect(boldElement.tagName).toBe("STRONG");
  });

  it("renders mixed italic and bold text", () => {
    const messages = [
      { role: "assistant", agent: "TestAgent", content: "This is *italic* and this is **bold**" },
    ];
    render(<ChatInterface messages={messages} loading={false} onSend={() => {}} disabled={false} />);
    const em = screen.getByText(/italic/i);
    const strong = screen.getByText(/bold/i);
    expect(em.tagName).toBe("EM");
    expect(strong.tagName).toBe("STRONG");
  });

  it("renders plain text without formatting", () => {
    const messages = [
      { role: "assistant", agent: "TestAgent", content: "This is plain text without any formatting" },
    ];
    render(<ChatInterface messages={messages} loading={false} onSend={() => {}} disabled={false} />);
    const text = screen.getByText(/plain text without any formatting/i);
    expect(text.tagName).toBe("P");
  });
});