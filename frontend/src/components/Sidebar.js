import React, { useRef } from 'react';
import { Search, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ documents, selectedDocId, onSelectDocument, onSearch, isLoading, onFileUpload }) => {
    const fileInputRef = useRef(null);
    return (
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b"><h1 className="text-xl font-bold">Adobe Finale</h1><p className="text-sm text-slate-500">Connecting the Dots</p></div>
            <div className="p-4 space-y-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 text-slate-400" /><input type="text" placeholder="Search library..." onChange={(e) => onSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg" /></div>
                <input type="file" ref={fileInputRef} onChange={onFileUpload} className="hidden" accept=".pdf" multiple />
                <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700"><UploadCloud size={20} /><span>Upload PDF(s)</span></button>
            </div>
            <nav className="flex-1 px-4 overflow-y-auto">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Library</h2>
                {isLoading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> : <ul className="space-y-1">{documents.map((doc, i) => (
                    <motion.li key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); onSelectDocument(doc.id); }} className={`flex items-center gap-3 p-2 rounded-lg ${selectedDocId === doc.id ? 'bg-indigo-500 text-white' : 'hover:bg-slate-100'}`}><FileText className="w-5" /><span className="truncate">{doc.title}</span></a>
                    </motion.li>))}
                </ul>}
            </nav>
        </aside>
    );
};
export default React.memo(Sidebar);
