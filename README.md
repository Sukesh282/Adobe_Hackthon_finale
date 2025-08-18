# 🚀 Document Intelligence Engine - Adobe Hackathon 2025 Finale

This project, "Connecting the Dots," is a web-based, intelligent PDF reading application built for the Adobe Hackathon 2025 Finale. It transforms a static library of documents into an interconnected web of knowledge, powered by local AI for recommendations and external LLMs for deeper insights.

![App Screenshot](https://raw.githubusercontent.com/m-ali-awan/screenshots/main/doc-intel-app-ss.png)

---

### ✨ Vision & Key Features

Our vision is to create a reading experience that goes "beyond the page." The application helps users—from researchers to students—understand content faster and discover hidden connections across their entire document library.

#### Base Features (Offline, CPU-Based)
-   **High-Fidelity PDF Viewing**: Utilizes the **Adobe PDF Embed API** for perfect rendering, zooming, and panning.
-   **Batch & Drag-and-Drop Uploads**: Quickly build a personal library by uploading multiple PDFs at once.
-   **Context-Aware Recommendations**: When viewing a document, the system surfaces thematically related sections from other documents in the library.
-   **Dynamic Highlighting**: Clicking a recommendation instantly **highlights** the relevant text within the PDF viewer (conceptual implementation via Search API).
-   **Fast & Efficient**: Local recommendations are generated in under 2 seconds using a CPU-based Sentence-Transformer model.

#### Follow-On Features (LLM & Cloud-Powered)
-   **💡 Insights Bulb**: An LLM-powered feature (compatible with Gemini, Azure, OpenAI via environment variables) that provides key insights, interesting facts, and potential counterpoints.
-   **🎧 Podcast Mode**: Generates a short (2-5 min) audio overview of the current document section using Azure's Text-to-Speech service, complete with insights from the "Insights Bulb."

---

### 💻 Built With

-   **Frontend:** React.js, Tailwind CSS, **Adobe PDF Embed API**
-   **Backend:** FastAPI (Python), Uvicorn
-   **Database:** SQLite (via SQLAlchemy)
-   **Base Recommendations (NLP):** `sentence-transformers/all-MiniLM-L6-v2`
-   **LLM Integration:** Pluggable service for Gemini, Azure OpenAI, and OpenAI.
-   **Text-to-Speech (TTS):** Azure Cognitive Services.
-   **Containerization:** Docker & Docker Compose

---

### ⚙️ Getting Started

#### Prerequisites
-   Docker & Docker Compose
-   Python 3.9+
-   An Adobe PDF Embed API Key

#### Local Setup (Internet Required for First Run)

1.  **Clone the Repository:**
    ```sh
    git clone https://github.com/YourUsername/your-repo-name.git
    cd your-repo-name
    ```

2.  **Set Up Environment Variables:**
    -   Create a free API key for the **Adobe PDF Embed API** [here](https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/gettingstarted/).
    -   Create a `.env` file in the project root by copying the template:
        ```sh
        cp .env.template .env
        ```
    -   Open the `.env` file and add your Adobe API Key and any optional keys for follow-on features.

3.  **Download the Local NLP Model:**
    ```sh
    pip install sentence-transformers
    python backend/download_model.py
    ```

4.  **Build and Run with Docker Compose:**
    ```sh
    docker-compose up --build
    ```

5.  **Access the Application:**
    Open your browser to [**http://localhost:8080**](http://localhost:8080).

---
### Demo Flow
1.  **Start:** Show the empty application.
2.  **Upload:** Drag and drop 3-4 related PDFs (e.g., papers on AI, project briefs).
3.  **Explore:** Select the main document. Use the Adobe Viewer's zoom/pan features.
4.  **Base Feature Magic**: In the "Related Content" panel, click on a recommendation. Show that a search is initiated in the viewer to locate the text.
5.  **Follow-on Magic 1 (Insights Bulb)**: Click the 💡 icon. Show the generated insights, facts, and counterpoints appearing in the panel.
6.  **Follow-on Magic 2 (Podcast Mode)**: Click the 🎧 icon. Play the generated audio summary. 
