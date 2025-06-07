import google.generativeai as genai

# Replace with your actual Gemini API key
genai.configure(api_key="AIzaSyBQbK4MobPMlqgi5LtCMle4EaPDMjcyNKk")

# Load the model with safety settings
model = genai.GenerativeModel('gemini-2.0-flash',
    safety_settings=[
        {"category": "HARM_CATEGORY_DANGEROUS", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"}
    ]
)

def get_ai_reply(prompt: str) -> str:
    try:
        response = model.generate_content(prompt)
        return response.text.strip() if response and response.text else "No response from AI"
    except Exception as e:
        return f"Error: {str(e)}"


def generate_session_title(text: str) -> str:
    try:
        response = model.generate_content(
            f"Convert this text into a clear, concise title (3-5 words): '{text}'. "
            "Follow these rules: "
            "1. Use title case "
            "2. No ending punctuation "
            "3. Focus on main keywords "
            "4. Keep it descriptive but short "
            "5. Should be a summarized meaningful title "
            "6. Do not use the words like Perl, Code, Script "
            "eg: Query: Write a program to add 2 numbers  title: Addition of Two Numbers"
        )
        return response.text.strip('"').strip("'").replace("\n", " ") if response and response.text else "Title generation failed"
    except Exception as e:
        return f"Error: {str(e)}"