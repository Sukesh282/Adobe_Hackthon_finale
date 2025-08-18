import React from 'react';
import { motion } from 'framer-motion';

const AudioPlayer = ({ audioUrl }) => {
    if (!audioUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
        >
            <h3 className="font-bold text-slate-600 mb-2">🎧 Audio Overview</h3>
            <audio controls autoPlay src={audioUrl} className="w-full">
                Your browser does not support the audio element.
            </audio>
        </motion.div>
    );
};

export default AudioPlayer; 
