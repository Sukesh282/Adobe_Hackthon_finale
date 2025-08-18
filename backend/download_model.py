import os
from sentence_transformers import SentenceTransformer

MODEL_NAME = 'all-MiniLM-L6-v2'
MODEL_PATH = f'models/{MODEL_NAME}'

if not os.path.exists(MODEL_PATH):
    print(f"Downloading NLP model ({MODEL_NAME})... This may take a moment.")
    # This model is small, efficient, and great for general-purpose embeddings.
    model = SentenceTransformer(MODEL_NAME)
    print(f"Saving model to `{MODEL_PATH}`...")
    model.save(MODEL_PATH)
    print("\nModel saved successfully.")
    print("You are now ready to build the Docker containers.")
else:
    print(f"Model already exists at `{MODEL_PATH}`. No download needed.") 
