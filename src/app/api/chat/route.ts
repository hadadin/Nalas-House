import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are the household assistant for Nala's House. You help with:
- Weekly menu generation and meal planning
- Grocery / shopping list management  
- Household tasks and reminders
- Food preferences and dietary settings
- General household questions

Keep responses concise and friendly. When the user asks to navigate somewhere, include an action object at the end.
Available routes: "/" (home), "/food" (menu/grocery/chef), "/tasks", "/finance", "/account".

If they ask to go somewhere, end your response with: [NAVIGATE:/route]`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { messages, context } = await request.json();

  const contextStr = context ? `
Current context:
- User: ${context.account?.user_name ?? "unknown"}, Partner: ${context.account?.partner_name ?? "unknown"}
- Pending tasks: ${(context.tasks ?? []).filter((t: { done: boolean }) => !t.done).length}
- Has menu: ${!!context.menuId}
- Diet preferences: ${context.preferences?.dietary_rules?.join(", ") || "none set"}
` : "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: "claude-opus-4-5",
          max_tokens: 1024,
          system: SYSTEM + contextStr,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        });

        let fullText = "";
        for await (const chunk of response) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const delta = chunk.delta.text;
            fullText += delta;

            // Check for navigation action marker
            const navMatch = delta.match(/\[NAVIGATE:([^\]]+)\]/);
            if (navMatch) {
              const cleanDelta = delta.replace(/\[NAVIGATE:[^\]]+\]/, "").trim();
              if (cleanDelta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: cleanDelta })}\n\n`));
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: "navigate", path: navMatch[1] })}\n\n`));
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Chat error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: `Sorry, something went wrong: ${msg}` })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
