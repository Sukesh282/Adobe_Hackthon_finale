import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AdobeViewer from './components/AdobeViewer';
import InsightsPanel from './components/InsightsPanel';
import { getDocuments, uploadDocument, getPdfUrl } from './api/api';

function App() {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    // State to hold the Adobe Viewer API object
    const [adobeApi, setAdobeApi] = useState(null);

    const fetchDocuments = useCallback(async (newDocIdToSelect = null) => {
        try {
            const response = await getDocuments();
            const docs = response.data;
            setDocuments(docs);
            setFilteredDocuments(docs);

            if (newDocIdToSelect) {
                setSelectedDocId(newDocIdToSelect);
            } else if (docs.length > 0 && !selectedDocId) {
                setSelectedDocId(docs.id);
            }
        } catch (error) { setMessage('Error connecting to backend.') }
        finally { setIsLoading(false) }
    }, [selectedDocId]);

    useEffect(() => { fetchDocuments() }, []);

    const handleFileUpload = useCallback(async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setMessage(`Uploading ${files.length} document(s)...`);
        const uploadPromises = Array.from(files).map(file => uploadDocument(file).catch(e => ({ error: true, name: file.name, detail: e.response?.data?.detail })));
        const results = await Promise.all(uploadPromises);
        const successful = results.filter(r => !r.error);
        if (successful.length > 0) await fetchDocuments(successful[successful.length - 1].data.id);
        // ... (rest of the upload handling logic can be added here)
        event.target.value = null;
    }, [fetchDocuments]);

    // The function passed to the panel to handle highlighting
    const handleHighlight = useCallback((textToSearch) => {
        if (adobeApi) {
            // The search API is the standard way to implement this in the Adobe SDK
            adobeApi.search(textToSearch);
        }
    }, [adobeApi]);

    const handleSearch = (term) => setFilteredDocuments(documents.filter(doc => doc.title.toLowerCase().includes(term.toLowerCase())));
    const handleSelectDocument = useCallback((id) => { setSelectedDocId(id) }, []);

    // Callback to get the Adobe API object from the viewer component
    const onViewerReady = useCallback(() => console.log("Adobe Viewer is ready."), []);
    const getApiCallback = useCallback((api) => setAdobeApi(api), []);

    return (
        <div className="h-screen w-screen bg-slate-100 flex font-sans overflow-hidden">
            <Sidebar documents={filteredDocuments} selectedDocId={selectedDocId} onSelectDocument={handleSelectDocument} onSearch={handleSearch} isLoading={isLoading} onFileUpload={handleFileUpload} />
            <main className="flex-1 flex flex-col">
                {message && <div className="text-center p-1 bg-yellow-100 text-yellow-800">{message}</div>}
                <div className="flex-1 flex h-full overflow-hidden">
                    <AdobeViewer docId={selectedDocId} pdfUrl={getPdfUrl(selectedDocId)} onReady={onViewerReady} getApi={getApiCallback} />
                    <InsightsPanel docId={selectedDocId} onHighlight={handleHighlight} />
                </div>
            </main>
        </div>
    );
}
export default App; 
