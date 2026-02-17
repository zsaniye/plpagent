import { NextRequest, NextResponse } from "next/server";
import {
  processMessage,
  getWelcomeMessage,
  getInitialState,
} from "@/lib/ai-engine";
import { ChatMessage, ConversationState } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      state,
      history,
    }: {
      message: string;
      state: ConversationState | null;
      history: ChatMessage[];
    } = body;

    const currentState = state || getInitialState();

    if (!message && history.length === 0) {
      // Initial greeting
      return NextResponse.json({
        message: getWelcomeMessage(),
        state: currentState,
      });
    }

    const result = processMessage(message, currentState, history);

    return NextResponse.json({
      message: result.message,
      state: result.updatedState,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
