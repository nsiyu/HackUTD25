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
    prompt = (
        "here is the part of the lecture notes that the user wants to edit:\n"
        f"{selected_text}\n\n"
        "their suggestion for modification is:\n"
        f"{suggestion}\n\n"
        "please provide the updated lecture content with the suggested modification applied."
    )

    try:
        response = client.chat.completions.create(
            model="Meta-Llama-3.1-8B-Instruct",
            messages=[
                {"role": "system", "content": "You are an expert note editor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            top_p=0.1
        )

        if response and response.choices:
            return response.choices[0].message.content.strip()
        else:
            raise ValueError("Invalid response from SambaNova API")
    except Exception as e:
        print(f"Error calling SambaNova API: {str(e)}")
        raise

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