import { useEffect, useState, useCallback } from 'react';

const useAdobePdfApi = (clientId) => {
    const [adobeDCView, setAdobeDCView] = useState(null);

    // Load the Adobe View SDK and initialize the View object
    useEffect(() => {
        if (window.AdobeDC) {
            const view = new window.AdobeDC.View({ clientId });
            setAdobeDCView(view);
        } else {
            document.addEventListener("adobe_dc_view_sdk.ready", () => {
                const view = new window.AdobeDC.View({ clientId });
                setAdobeDCView(view);
            });
        }
    }, [clientId]);

    // Create a memoized function to render the PDF
    const previewPdf = useCallback((pdfUrl, divId) => {
        if (!adobeDCView) return;

        // Clear the container before rendering a new PDF
        const container = document.getElementById(divId);
        if (container) container.innerHTML = '';

        const previewFilePromise = adobeDCView.previewFile({
            content: { location: { url: pdfUrl } },
            metaData: { fileName: "document.pdf" }
        }, {
            embedMode: "SIZED_CONTAINER",
            showLeftHandPanel: false,
            showAnnotationTools: false,
            showDownloadPDF: true,
            showPrintPDF: true,
        });

        return previewFilePromise;

    }, [adobeDCView]);

    return { previewPdf };
};

export default useAdobePdfApi;
