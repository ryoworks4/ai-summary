export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { text, format } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const formatInstructions = {
        bullet: '箇条書き（「・」で始める）で要約してください。重要なポイントを3〜5個に絞ってください。',
        oneline: '1〜2文で簡潔に要約してください。最も重要な情報だけを含めてください。',
        report: '以下の形式で要約してください:\n【概要】1〜2文の全体要約\n【実施事項】箇条書き\n【次のアクション】あれば箇条書き'
    };

    const prompt = `以下のテキストを要約してください。

【出力形式】
${formatInstructions[format] || formatInstructions.bullet}

【ルール】
- 元のテキストの情報を正確に反映する
- 冗長な表現を削り、簡潔にまとめる
- 敬語は使わず、体言止めまたは「だ・である」調で書く
- 余計な前置きや説明は不要。要約だけを出力する

【テキスト】
${text}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.3
                    }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini API error:', await response.text());
            return res.status(502).json({ error: 'AI service error' });
        }

        const data = await response.json();
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text
            || '要約を生成できませんでした。';

        return res.status(200).json({ summary });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
