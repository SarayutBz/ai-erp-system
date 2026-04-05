const fs = require('fs')

const parseInvoice = async (filePath, mimeType) => {
  // อ่านไฟล์แล้วแปลงเป็น base64
  const fileData = fs.readFileSync(filePath)
  const base64 = fileData.toString('base64')

  const prompt = `
You are an invoice parser. Extract the following information from this invoice image or PDF.
Return ONLY valid JSON, no explanation, no markdown, no backticks.

Required format:
{
  "customer_name": "string",
  "customer_email": "string or null",
  "customer_phone": "string or null",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unit_price": number
    }
  ]
}

Rules:
- If a field is not found, use null
- quantity and unit_price must be numbers, not strings
- items must be an array even if only 1 item
`

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        // temperature 0 = deterministic ที่สุด ลด hallucination
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini returned empty response')
  }

  // clean และ parse JSON
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${text}`)
  }
}

module.exports = { parseInvoice }