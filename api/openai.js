export default async function handler(req, res) {
    const { message, category } = req.body;

    if (!message || !category) {
        return res.status(400).json({ error: "Message and category are required." });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: `You are an expert in ${category}. Provide only relevant answers within this topic.` 
                    },
                    { role: "user", content: message }
                ],
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            return res.status(response.status).json({ error: "OpenAI API error: " + (errorData.error?.message || "Unknown error") });
        }

        const data = await response.json();
        res.status(200).json({ message: data.choices?.[0]?.message?.content || "No response available." });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to connect to OpenAI API" });
    }
}
