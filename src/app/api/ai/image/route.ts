import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating image with DALL-E 3 for prompt:', prompt);
    
    // Call the OpenAI API for image generation using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    console.log('Received image from DALL-E 3');

    // Get the image URL from the response
    const imageUrl = response.data[0].url;
    
    // In a production app, you might want to:
    // 1. Download the image from the URL
    // 2. Store it in your own storage (S3, Cloudinary, Appwrite Storage, etc.)
    // 3. Return your own hosted URL
    
    return NextResponse.json({
      imageUrl: imageUrl,
      userId,
    });
  } catch (error: any) {
    console.error('Error in DALL-E 3 API:', error);
    
    // Check for specific error types
    if (error.code === 'content_policy_violation') {
      return NextResponse.json(
        { 
          error: "Your image couldn't be generated due to content policy restrictions. Please try a different prompt that doesn't reference specific brands, celebrities, or potentially sensitive content.",
          errorType: "content_policy"
        }, 
        { status: 400 }
      );
    } else if (error.status === 429) {
      return NextResponse.json(
        { 
          error: "We've reached our limit for image generation. Please try again later.",
          errorType: "rate_limit" 
        }, 
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: `Failed to generate image: ${error.message}`,
        errorType: "general_error"
      },
      { status: 500 }
    );
  }
} 