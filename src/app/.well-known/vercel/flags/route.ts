import { type NextRequest, NextResponse } from "next/server";
import { type ApiData, verifyAccess } from "@vercel/flags";

export async function GET(request: NextRequest) {
  const access = await verifyAccess(request.headers.get("Authorization"));
  if (!access) return NextResponse.json(null, { status: 401 });

  return NextResponse.json<ApiData>({
    definitions: {
      showAnthropic: {
        description: "Controls whether the Anthropic model is visible",
        origin: "https://willowlm.com/#show-anthropic",
        options: [
          { value: false, label: "Off" },
          { value: true, label: "On" },
        ],
      },
      showGemini: {
        description: "Controls whether the Gemini model is visible",
        origin: "https://willowlm.com/#show-gemini",
        options: [
          { value: false, label: "Off" },
          { value: true, label: "On" },
        ],
      },
    },
  });
}
