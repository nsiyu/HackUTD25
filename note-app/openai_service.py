import openai
import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import chromadb
from datetime import datetime

load_dotenv()

api_key = os.getenv("SAMBANOVA_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
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
        
        if selected_text not in full_content:
            raise ValueError("Selected text not found in full content")
            
        updated_content = full_content.replace(selected_text, edited_text, 1)
        return updated_content
        
    except Exception as e:
        print(f"Error in get_openai_edit: {str(e)}")
        raise ValueError(f"Failed to process edit: {str(e)}")

async def get_openai_process_lecture(current_content: str, lecture_content: str) -> str:
    try:
        print("Starting lecture processing...")
        
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        # Initialize ChromaDB and embeddings
        try:
            embeddings = OpenAIEmbeddings(api_key=openai_api_key)
            persist_directory = "data/chroma_db"
            os.makedirs(persist_directory, exist_ok=True)
            
            vector_store = Chroma(
                persist_directory=persist_directory,
                embedding_function=embeddings,
                collection_name="lecture_notes"
            )

            # Store new lecture content
            vector_store.add_texts(
                texts=[lecture_content],
                metadatas=[{"type": "lecture", "date": datetime.now().isoformat()}]
            )

            # Search for similar content
            similar_content = vector_store.similarity_search(
                lecture_content,
                k=2
            )
            similar_docs = "\n".join([doc.page_content for doc in similar_content])
            vector_store.persist()
            
        except Exception as e:
            print(f"Vector store operations failed: {str(e)}")
            similar_docs = ""  # Continue without similar content if vector store fails
        
        print("Vector store operations completed")

        # Create CrewAI researcher agent
        try:
            researcher = Agent(
                role="Research Assistant",
                goal="Find relevant information related to lecture content",
                backstory="Expert at analyzing and finding relevant academic content",
                allow_delegation=False,
                verbose=True  # Add verbose logging
            )

            research_task = Task(
                description=f"Analyze and find relevant information for: {lecture_content}",
                agent=researcher
            )

            crew = Crew(
                agents=[researcher],
                tasks=[research_task],
                verbose=True  # Add verbose logging
            )
            
            print("Starting CrewAI research...")
            research_result = crew.kickoff()
            print("CrewAI research completed")
            
        except Exception as e:
            print(f"CrewAI operations failed: {str(e)}")
            research_result = ""  # Continue without research if CrewAI fails

        # Combine all content
        combined_content = f"""Current Notes:
        {current_content}

        New Lecture Content:
        {lecture_content}

        Similar Previous Content:
        {similar_docs}

        Research Findings:
        {research_result}"""

        print("Processing with OpenAI...")
        
        # Process with OpenAI
        response = client.chat.completions.create(
            model="Meta-Llama-3.1-8B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at processing and organizing lecture notes. Combine the current notes, new lecture content, similar previous content, and research findings into a well-structured, coherent set of notes. Keep the notes concise and to the point. Only include information that is relevant to the lecture."
                },
                {
                    "role": "user",
                    "content": combined_content
                }
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        print("OpenAI processing completed")
        return response.choices[0].message.content

    except Exception as e:
        print(f"Detailed error in get_openai_process_lecture: {str(e)}")
        raise Exception(f"Processing error: {str(e)}")

async def get_openai_diagram(text: str) -> str:
    try:
        response = client.chat.completions.create(
            model="Meta-Llama-3.1-8B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": """You are a diagram generator that ONLY outputs valid Mermaid.js syntax.
                    DO NOT include any explanations or text before or after the diagram.
                    For flowcharts, use this format:
                    flowchart TD
                      A[Step 1] --> B[Step 2]
                      B --> C[Step 3]
                    
                    For sequence diagrams:
                    sequenceDiagram
                      participant A
                      participant B
                      A->>B: Message
                    
                    For class diagrams:
                    classDiagram
                      class A
                      A : +method()
                    
                    Always test that your output is valid Mermaid syntax.
                    Use simple arrows --> for connections.
                    Avoid using special characters in node text."""
                },
                {
                    "role": "user",
                    "content": f"Convert this text to a Mermaid diagram. Use the most appropriate diagram type:\n{text}"
                }
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        diagram = response.choices[0].message.content.strip()
        return diagram
        
    except Exception as e:
        print("Error generating diagram:", str(e))
        raise

async def search_previous_lectures(query: str, k: int = 5):
    embeddings = OpenAIEmbeddings()
    vector_store = Chroma(
        persist_directory="data/chroma_db",
        embedding_function=embeddings,
        collection_name="lecture_notes"
    )
    
    results = vector_store.similarity_search(query, k=k)
    return [{"content": doc.page_content, "metadata": doc.metadata} for doc in results]