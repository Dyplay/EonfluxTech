import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

// Define a custom system prompt that gives the AI a specific role and personality
const SYSTEM_PROMPT = `You are NEXUS, the AI assistant for the Next Foundation website. 
Your personality is friendly, knowledgeable, and slightly witty. You specialize in:

1. Web Development - You're an expert in React, Next.js, and modern frontend technologies
2. User Experience - You can provide design advice and best practices for web interfaces
3. Project Management - You help users organize their development workflows efficiently

When users ask questions, provide concise, practical answers with code examples when relevant.
Always format code using proper markdown syntax with language specification.

For example:
\`\`\`javascript
function example() {
  return "Hello World";
}
\`\`\`

Remember that you're representing the Next Foundation platform, which aims to make web development 
more accessible and efficient. Your tone should be professional but approachable.`;

export async function POST(req: Request) {
  try {
    const { message, userId, chatHistory = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Format chat history for OpenAI's chat completion API
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Create messages array for chat completion
    const messages = [
      // System message to set the context and behavior
      { role: 'system', content: SYSTEM_PROMPT },
      // If there's chat history, include it
      ...formattedHistory,
      // Add the current message
      { role: 'user', content: message }
    ];

    console.log('Sending the following messages to OpenAI GPT-4o:', messages.length);

    // Call the OpenAI API with Chat Completions using GPT-4o
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using the GPT-4o model
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800,
    });

    console.log('Received response from GPT-4o');

    // Get the assistant's reply
    const assistantMessage = response.choices[0].message.content;

    return NextResponse.json({
      message: assistantMessage,
      userId,
    });
  } catch (error: any) {
    console.error('Error in GPT-4o API:', error);
    
    // If the model isn't available, fall back to text-davinci-003
    if (error.message && error.message.includes('model')) {
      try {
        console.log('Falling back to text-davinci-003');
        
        // Format a text prompt instead with the custom system prompt
        let prompt = `${SYSTEM_PROMPT}

`;
        
        // Add chat history to the prompt
        if (chatHistory.length > 0) {
          chatHistory.forEach((msg: any) => {
            const role = msg.role === 'user' ? 'User' : 'NEXUS';
            prompt += `${role}: ${msg.content}\n`;
          });
        }
        
        // Add the current message
        prompt += `User: ${message}\nNEXUS:`;
        
        // Call the OpenAI API with Completions API as backup
        const fallbackResponse = await openai.completions.create({
          model: 'text-davinci-003',
          prompt,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
        });
        
        const fallbackMessage = fallbackResponse.choices[0].text.trim();
        
        return NextResponse.json({
          message: fallbackMessage,
          userId,
        });
      } catch (fallbackError: any) {
        console.error('Error in fallback API:', fallbackError);
        return NextResponse.json(
          { error: `Failed to get response from any available model: ${fallbackError.message}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Failed to get response: ${error.message}` },
      { status: 500 }
    );
  }
}
