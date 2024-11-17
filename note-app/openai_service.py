import openai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("SAMBANOVA_API_KEY")
if not api_key:
    print("Environment variables loaded:")
    print(dict(os.environ))
    raise ValueError("SAMBANOVA_API_KEY not found in environment variables")

client = openai.OpenAI(
    api_key=api_key,
    base_url="https://api.sambanova.ai/v1"
)

async def get_openai_edit(full_content: str, selected_text: str, suggestion: str) -> str:
    # Validate inputs
    if not selected_text.strip():
        raise ValueError("Selected text must not be empty.")
    if not suggestion.strip():
        raise ValueError("Suggestion must not be empty.")

    try:
        response = client.chat.completions.create(
            model="Meta-Llama-3.1-8B-Instruct",
            messages=[
                {"role": "system", "content": "You are an expert note editor."},
                {"role": "user", "content": f"""
                Original text: {selected_text}
                Edit instruction: {suggestion}
                
                Provide only the edited version of the text, maintaining the same style and format. If the suggestion is to remove the text, do not include it in the edited text just replace it with empty string.
                """}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        edited_text = response.choices[0].message.content.strip()
        
        # Replace the selected text with the edited version in the full content
        if selected_text not in full_content:
            raise ValueError("Selected text not found in full content")
            
        updated_content = full_content.replace(selected_text, edited_text, 1)
        return updated_content
        
    except Exception as e:
        print(f"Error in get_openai_edit: {str(e)}")
        raise ValueError(f"Failed to process edit: {str(e)}")

async def get_openai_process_lecture(current_content: str, lecture_content: str) -> str:
    try:
        response = client.chat.completions.create(
            model="Meta-Llama-3.1-8B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at processing and organizing lecture notes. Your task is to take the current notes and new lecture content and merge them into a well-structured, coherent document. Maintain academic tone and organize content logically."
                },
                {
                    "role": "user",
                    "content": f"""Current Notes:
{current_content}

New Lecture Content:
{lecture_content}

Please process and merge these into well-structured notes, maintaining the existing format and adding new information appropriately."""
                }
            ],
            temperature=0.3,
            max_tokens=4000
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")