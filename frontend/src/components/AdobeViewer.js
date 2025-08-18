import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Get the Adobe API Key from environment variables.
// In Create React App, env vars must start with REACT_APP_.
const ADOBE_API_KEY = process.env.REACT_APP_ADOBE_API_KEY;

const AdobeViewer = ({ docId, pdfUrl, onReady, getApi }) => {
    const viewerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ADOBE_API_KEY) {
            setError("Adobe API Key is missing. Please check your .env configuration.");
            setIsLoading(false);
            return;
        }

        if (!docId || !pdfUrl) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Function to render the PDF
        const renderPdf = () => {
            // Clear previous viewer instance if it exists
            if (viewerRef.current) {
                const viewerElement = document.getElementById('adobe-pdf-viewer');
                if (viewerElement) viewerElement.innerHTML = '';
            }

            const adobeDCView = new window.AdobeDC.View({
                clientId: ADOBE_API_KEY,
                divId: "adobe-pdf-viewer",
            });

            const previewFilePromise = adobeDCView.previewFile({
                content: { location: { url: pdfUrl } },
                metaData: { fileName: `document-${docId}.pdf` },
            }, {
                embedMode: "SIZED_CONTAINER",
                showLeftHandPanel: false, // We use our own sidebar/outline
                showAnnotationTools: true,
                showDownloadPDF: true,
                showPrintPDF: true,
            });

            previewFilePromise.then(adobeViewer => {
                adobeViewer.getAPIs().then(api => {
                    getApi(api); // Pass the API object to the parent component
                    onReady(); // Notify parent that rendering is complete
                    setIsLoading(false);
                });
            });
        };

        // Adobe SDK can be slow to load, so we check for its existence
        if (window.AdobeDC) {
            renderPdf();
        } else {
            document.addEventListener("adobe_dc_view_sdk.ready", renderPdf);
        }

        return () => {
            document.removeEventListener("adobe_dc_view_sdk.ready", renderPdf);
        }

    }, [docId, pdfUrl, onReady, getApi]);


    if (error) {
        return <div className="flex-1 w-full h-full flex items-center justify-center bg-red-100 text-red-700 p-4">{error}</div>;
    }

    if (!docId) {
        return <div className="flex-1 w-full h-full flex items-center justify-center bg-slate-200">Select a document to get started.</div>
    }

    return (
        <div id="adobe-pdf-viewer-container" className="flex-1 w-full h-full relative">
            {isLoading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/50"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>}
            <div id="adobe-pdf-viewer" className="w-full h-full" />
        </div>
    );
};

export default React.memo(AdobeViewer); 
