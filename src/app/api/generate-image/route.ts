import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Replicate from "replicate";

export const runtime = "nodejs"; // add this line

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface StylePrompts {
  [key: string]: string;
}

const stylePrompts: StylePrompts = {
  Cute: "Render in a soft, pastel palette with rounded shapes and exaggerated proportions. Emphasize large, sparkling eyes and gentle, cuddly textures. Add small, endearing details like rosy cheeks or tiny accessories. Use warm, diffused lighting to create a cozy atmosphere. Incorporate subtle, kawaii-inspired elements for extra charm. Style: cheerful cartoon with a touch of realism.",
  Scary:
    "Utilize high contrast lighting with deep shadows and eerie highlights. Employ a desaturated color palette dominated by cold, unsettling tones. Emphasize jagged shapes, unsettling textures, and distorted proportions. Add subtle, creepy details in the background. Incorporate elements of body horror or cosmic dread where appropriate. Style: dark surrealism with photorealistic textures.",
  Serene:
    "Use a soft, muted color palette with gentle gradients. Emphasize smooth, flowing lines and harmonious compositions. Incorporate subtle, atmospheric effects like mist or gentle bokeh. Employ soft, diffused lighting reminiscent of golden hour. Add delicate details that invite contemplation. Style: impressionistic realism with minimalist influences.",
  Fun: "Utilize a vibrant, saturated color palette with bold contrasts. Emphasize dynamic poses, exaggerated expressions, and comical proportions. Incorporate visual puns and amusing background details. Use energetic linework and playful textures. Add whimsical, physically impossible elements for extra amusement. Style: stylized cartoon with exaggerated realism for humor.",
};

const penguinPrompts: StylePrompts = {
  Cute: "a cute and adorable penguin scene,",
  Fun: "a fun and playful penguin scene,",
  Scary: "a slightly spooky penguin scene,",
  Serene: "a calm and peaceful penguin scene,",
};

interface RequestBody {
  prompt: string;
  style: keyof typeof stylePrompts;
  outputQuality?: number;
  numInferenceSteps?: number;
  aspectRatio?: string;
}

interface ReplicateInput {
  prompt: string;
  hf_lora: string;
  output_quality: number;
  num_inference_steps: number;
  aspect_ratio: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      prompt,
      style,
      outputQuality = 50,
      numInferenceSteps = 20,
      aspectRatio = "16:9",
    }: RequestBody = await request.json();

    if (!prompt || !style) {
      return NextResponse.json(
        { error: "Missing prompt or style" },
        { status: 400 }
      );
    }

    // Step 1: Generate image description with OpenAI
    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates detailed image descriptions based on prompts. Focus on visual elements and avoid mentioning text or writing.",
        },
        {
          role: "user",
          content: `Create a detailed image description for: ${penguinPrompts[style]} ${prompt}`,
        },
      ],
      max_tokens: 150,
    });

    const generatedPrompt = openAIResponse.choices[0].message.content;

    if (!generatedPrompt) {
      throw new Error("Failed to generate prompt from OpenAI");
    }

    // Step 2: Generate image with Replicate
    const fullPrompt = `${generatedPrompt} ${stylePrompts[style]}`;
    const replicateInput: ReplicateInput = {
      prompt: fullPrompt,
      hf_lora: "pajke/pudgy2",
      output_quality: outputQuality,
      num_inference_steps: numInferenceSteps,
      aspect_ratio: aspectRatio,
    };

    const output = (await replicate.run(
      "lucataco/flux-dev-lora:613a21a57e8545532d2f4016a7c3cfa3c7c63fded03001c2e69183d557a929db",
      { input: replicateInput }
    )) as string[];

    if (!output || !output[0]) {
      throw new Error("Failed to generate image from Replicate");
    }

    const imageUrl = output[0];

    return NextResponse.json({ imageUrl, generatedPrompt });
  } catch (error) {
    console.error("Error in generate-image API:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
