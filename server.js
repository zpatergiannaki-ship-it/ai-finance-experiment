const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatCompletion(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    throw new Error('Failed to fetch chat completion');
  }
}

// Example usage
(async () => {
  const prompt = 'Once upon a time...';
  const completion = await getChatCompletion(prompt);
  console.log(completion);
})();