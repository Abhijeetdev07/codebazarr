const fetch = require('node-fetch');

exports.generateDescription = async (req, res) => {
    try {
        const { title, category, price, technologies } = req.body;

        // Validate required fields
        if (!title || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title and Category are required'
            });
        }

        const techStack = Array.isArray(technologies) ? technologies.join(', ') : technologies;

        const prompt = `Write a compelling and professional project description for a ${category} project named '${title}'. 
    Price: $${price}. 
    Tech Stack: ${techStack}. 
    
    The description should be engaging, highlighting the key features and technologies used. Keep it concise but persuasive, suitable for a digital marketplace listing. Write in pure plain text. Do not use markdown bolding (asterisks) or bullet points.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 250
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to generate description');
        }

        // Remove any markdown formatting the AI might still add
        const description = data.choices[0].message.content.replace(/\*\*/g, '').replace(/###/g, '');

        res.status(200).json({
            success: true,
            description
        });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};
