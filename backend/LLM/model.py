from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from LLM.vector import retriever

# Initialize the LLaMA 3.2 model
model = OllamaLLM(model="llama3.2")

# Define the prompt template for a legal assistant
template = """
You are Lawgan your personal legal assistant
You are an expert legal assistant with deep knowledge of legal principles, case law, statutes, and constitutional law, including the Constitution of the Democratic Socialist Republic of Sri Lanka. 
Provide accurate, concise, and professional responses to legal questions. 
Use the provided documents, which may include restaurant reviews and legal texts from PDFs (such as constitutional provisions), to inform your answer. 
Prioritize legal content from PDFs, especially constitutional texts, for questions related to legal or constitutional matters. Use restaurant reviews only if they contain relevant legal context (e.g., consumer protection or liability issues).

Relevant documents: {reviews}

User's legal question: {question}

Provide a clear and precise response, avoiding legal jargon where possible unless specifically requested. If the question relates to Sri Lankan law, reference relevant constitutional provisions or other legal documents when applicable.
"""
prompt = ChatPromptTemplate.from_template(template)

# Create the chain
chain = prompt | model

def get_legal_response(question: str) -> str:
    """
    Generate a response to a legal question using the retriever and model.
    
    Args:
        question (str): The legal question to answer.
    
    Returns:
        str: The model's response to the question.
    """
    if not question or not isinstance(question, str):
        return "Error: Invalid or empty question provided."
    
    try:
        # Retrieve relevant documents (CSV reviews or PDF legal texts)
        reviews = retriever.invoke(question)
        
        # Invoke the chain with the question and retrieved documents
        result = chain.invoke({"reviews": reviews, "question": question})
        
        return result
    except Exception as e:
        return f"Error generating response: {str(e)}"