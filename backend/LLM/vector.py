from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pandas as pd
import PyPDF2

# Initialize embeddings
embeddings = OllamaEmbeddings(model="mxbai-embed-large")

# Define paths
csv_file = "../realistic_restaurant_reviews.csv"  # Adjusted path for parent directory
pdf_dir = "../legal_pdfs"  # Adjusted path for parent directory
db_location = "../chroma_langchain_db"

# Check if vector store needs to be populated
add_documents = not os.path.exists(db_location)

# Initialize vector store
vector_store = Chroma(
    collection_name="combined_legal_reviews",
    persist_directory=db_location,
    embedding_function=embeddings
)

if add_documents:
    documents = []
    ids = []
    
    # Process CSV data
    if os.path.exists(csv_file):
        df = pd.read_csv(csv_file)
        for i, row in df.iterrows():
            document = Document(
                page_content=row["Title"] + " " + row["Review"],
                metadata={"source": "csv", "rating": row["Rating"], "date": row["Date"]},
                id=f"csv_{i}"
            )
            documents.append(document)
            ids.append(f"csv_{i}")
    
    # Process PDF data
    if os.path.exists(pdf_dir):
        for pdf_file in os.listdir(pdf_dir):
            if pdf_file.endswith(".pdf"):
                pdf_path = os.path.join(pdf_dir, pdf_file)
                with open(pdf_path, "rb") as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page_num, page in enumerate(pdf_reader.pages):
                        text = page.extract_text()
                        if text.strip():  # Only add non-empty pages
                            document = Document(
                                page_content=text,
                                metadata={"source": "pdf", "file": pdf_file, "page": page_num + 1},
                                id=f"pdf_{pdf_file}_{page_num}"
                            )
                            documents.append(document)
                            ids.append(f"pdf_{pdf_file}_{page_num}")
    
    # Add documents to vector store
    if documents:
        vector_store.add_documents(documents=documents, ids=ids)

# Create retriever
retriever = vector_store.as_retriever(search_kwargs={"k": 5})