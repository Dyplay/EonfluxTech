import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

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

    // Create messages array for chat completion with improved system message for code formatting
    const messages = [
      // System message to set the context and behavior with specific instructions for code formatting
      { 
        role: 'system', 
        content: `You are a helpful, friendly AI assistant with expertise in many topics. Respond concisely and helpfully to the user's queries.

When sharing code examples, always format them using proper markdown code blocks with language specification. For example:

\`\`\`python
def example_function():
    return "Hello World"
\`\`\`

\`\`\`javascript
function exampleFunction() {
    return "Hello World";
}
\`\`\`

This ensures code is displayed with proper syntax highlighting and formatting in the chat interface.`
      },
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
        
        // Format a text prompt instead with code formatting instructions
        let prompt = `You are a helpful, friendly AI assistant with expertise in many topics. Respond concisely and helpfully to the user's queries.

When sharing code examples, always format them using proper markdown code blocks with language specification. For example:

\`\`\`python
def example_function():
    return "Hello World"
\`\`\`

This ensures code is displayed with proper syntax highlighting and formatting.

`;
        
        // Add chat history to the prompt
        if (chatHistory.length > 0) {
          chatHistory.forEach((msg: any) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            prompt += `${role}: ${msg.content}\n`;
          });
        }
        
        // Add the current message
        prompt += `User: ${message}\nAssistant:`;
        
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
