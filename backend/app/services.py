import fitz, spacy, json, asyncio
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Global variables to hold the loaded models in memory
embedding_model: SentenceTransformer = None
nlp: spacy.Language = None

def load_models_on_startup():
    """Loads heavy models into memory once on application startup."""
    global embedding_model, nlp
    print("Loading local NLP models into memory...")
    embedding_model = SentenceTransformer("models/all-MiniLM-L6-v2")
    nlp = spacy.load("en_core_web_sm")
    print("Local NLP models loaded successfully.")

def _parse_and_embed(doc_path: str, doc_id: int) -> list:
    """CPU-bound: Extracts text and computes embeddings for each section of a PDF."""
    doc = fitz.open(doc_path)
    toc = doc.get_toc()
    sections_data = []
    
    if not toc: # Fallback for PDFs without a table of contents
        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            if len(text.strip()) > 50: # Only process pages with meaningful content
                embedding = embedding_model.encode(text, convert_to_tensor=False).tolist()
                sections_data.append({"heading": f"Page {page_num + 1}", "content": text, "page_num": page_num + 1, "embedding": json.dumps(embedding), "document_id": doc_id})
    else:
        for _, title, page_num in toc:
            page = doc.load_page(page_num - 1)
            text = page.get_text("text")
            if len(text.strip()) > 50:
                embedding = embedding_model.encode(text, convert_to_tensor=False).tolist()
                sections_data.append({"heading": title, "content": text, "page_num": page_num, "embedding": json.dumps(embedding), "document_id": doc_id})
            
    return sections_data

def _find_related_content(query_text: str, candidate_sections: list) -> list:
    """CPU-bound: Calculates similarity and returns top 3 recommendations."""
    if not candidate_sections: return []
    
    query_embedding = embedding_model.encode(query_text, convert_to_tensor=False)
    candidate_embeddings = np.array([json.loads(s.embedding) for s in candidate_sections])
    
    similarities = cosine_similarity([query_embedding], candidate_embeddings)[0]
    
    # Get top 3 indices, ensuring we don't go out of bounds
    top_k = min(3, len(candidate_sections))
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    recommendations = []
    for index in top_indices:
        if similarities[index] > 0.6: # Relevance threshold
             section = candidate_sections[index]
             recommendations.append({
                 "id": section.id, "heading": section.heading, "page_num": section.page_num,
                 "document_id": section.document.id, "document_title": section.document.filename
             })
    return recommendations


async def process_new_document(doc_path: str, doc_id: int):
    """Asynchronously run the CPU-bound parsing function in a separate thread."""
    return await asyncio.to_thread(_parse_and_embed, doc_path, doc_id)

async def get_local_recommendations(query_text: str, candidate_sections: list):
    """Asynchronously run the CPU-bound recommendation function in a separate thread."""
    return await asyncio.to_thread(_find_related_content, query_text, candidate_sections) 
