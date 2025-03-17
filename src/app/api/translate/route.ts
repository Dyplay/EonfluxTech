import { NextRequest, NextResponse } from 'next/server';

// DeepL API key
const DEEPL_API_KEY = '6e4c3abf-a784-4bd9-9798-24f7ccaddd75:fx';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.text || !body.target_lang) {
      console.error('Invalid request body:', body);
      return NextResponse.json(
        { error: 'Missing required fields: text and target_lang' },
        { status: 400 }
      );
    }
    
    console.log('Translating text to', body.target_lang);
    
    // Forward the request to DeepL API
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: body.text,
        target_lang: body.target_lang,
        // Add source language if available
        source_lang: body.source_lang || 'EN',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepL API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `DeepL API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Translation successful');
    
    // Return the response from DeepL
    return NextResponse.json(data);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 