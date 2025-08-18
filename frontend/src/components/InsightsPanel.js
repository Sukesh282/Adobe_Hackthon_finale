import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Book, Loader2, Lightbulb, Mic } from 'lucide-react';
import { getRecommendations, getLlmInsights, generatePodcast } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import AudioPlayer from './AudioPlayer'; // The new audio player component

const InsightsPanel = ({ docId, onHighlight }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [llmInsights, setLlmInsights] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const [isLoadingLlm, setIsLoadingLlm] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    // Automatically fetch local recommendations when a document changes
    useEffect(() => {
        // Reset states when document changes
        setRecommendations([]);
        setLlmInsights(null);
        setAudioUrl(null);

        if (!docId) return;

        setIsLoadingRecs(true);
        getRecommendations(docId)
            .then(res => setRecommendations(res.data.related_content))
            .catch(console.error)
            .finally(() => setIsLoadingRecs(false));
    }, [docId]);

    const handleLlmInsightsClick = () => {
        if (!docId) return;
        setIsLoadingLlm(true);
        setAudioUrl(null); // Stop audio if new insights are generated
        getLlmInsights(docId)
            .then(res => setLlmInsights(res.data))
            .catch(console.error)
            .finally(() => setIsLoadingLlm(false));
    };

    const handlePodcastClick = () => {
        if (!docId) return;
        setIsLoadingAudio(true);
        generatePodcast(docId)
            .then(res => setAudioUrl(res.data.audio_url))
            .catch(console.error)
            .finally(() => setIsLoadingAudio(false));
    }

    return (
        <div className="bg-white h-full flex flex-col border-l">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bot className="text-indigo-500" />Context Engine
                </h2>
            </div>

            <div className="p-4 flex gap-2 border-b">
                <button onClick={handleLlmInsightsClick} disabled={!docId || isLoadingLlm} className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 font-semibold py-2.5 rounded-lg hover:bg-yellow-500 disabled:bg-slate-400 disabled:text-white">
                    {isLoadingLlm ? <Loader2 className="animate-spin" /> : <Lightbulb />}<span>Insights Bulb</span>
                </button>
                <button onClick={handlePodcastClick} disabled={!docId || isLoadingAudio} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-slate-400">
                    {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Mic />}<span>Podcast Mode</span>
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                <AnimatePresence>{audioUrl && <AudioPlayer audioUrl={audioUrl} />}</AnimatePresence>

                <AnimatePresence>
                    {llmInsights && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div><h3 className="font-bold text-slate-600 mb-2">💡 Key Insight</h3><div className="bg-white p-4 rounded-lg border text-sm">{llmInsights.key_insight}</div></div>
                            <div><h3 className="font-bold text-slate-600 mb-2">❓ Did You Know?</h3><div className="bg-white p-4 rounded-lg border text-sm">{llmInsights.did_you_know}</div></div>
                            <div><h3 className="font-bold text-slate-600 mb-2">🤔 Counterpoint</h3><div className="bg-white p-4 rounded-lg border text-sm">{llmInsights.counterpoint}</div></div>
                        </motion.div>
                    )}</AnimatePresence>

                <div>
                    <h3 className="font-bold text-slate-600 mb-2 mt-6">Related Content</h3>
                    {isLoadingRecs ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> :
                        <div className="space-y-3">{recommendations.map((item, i) =>
                            <motion.div key={item.id} className="bg-white p-4 rounded-lg border cursor-pointer hover:border-indigo-500" onClick={() => onHighlight(item.heading)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <h4 className="font-semibold flex items-center gap-2"><Book size={16} />{item.heading}</h4>
                                <p className="text-xs text-slate-500 mt-1">from: {item.document_title}</p>
                            </motion.div>)}
                        </div>}
                </div>
            </div>
        </div>
    );
};

export default React.memo(InsightsPanel);
