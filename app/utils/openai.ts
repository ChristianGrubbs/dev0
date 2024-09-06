import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioFile: File): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
  });
  return transcription.text;
}

export async function processText(text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: text }],
    model: 'gpt-3.5-turbo',
  });
  return completion.choices[0].message.content || '';
}