import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Wand2, Cpu, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  status?: string;
}

const ProcessingModal = ({ isOpen, status = "Processing Video..." }: ProcessingModalProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const stages = [
    { text: "Optimizing Video...", icon: <Sparkles className="text-blue-400" /> },
    { text: "Extracting Audio...", icon: <Cpu className="text-purple-400" /> },
    { text: "AI Magic in Progress...", icon: <Wand2 className="text-pink-400" /> },
    { text: "Applying Final Polish...", icon: <CheckCircle2 className="text-emerald-400" /> }
  ];

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentStage((prev) => (prev + 1) % stages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-purple-950/20 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(100,83,130,0.2)] border border-white/50 text-center space-y-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-[2rem] border-4 border-dashed border-purple-200"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20"
                >
                  <Loader2 className="animate-spin" size={32} />
                </motion.div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-black text-[#2f2e36] tracking-tight">Hang Tight! 🚀</h3>
              <p className="text-gray-500 font-medium">We're using AI to localize your masterpiece.</p>
            </div>

            <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100/50 relative overflow-hidden">
               <motion.div 
                 className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                 animate={{ x: ["-100%", "100%"] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 style={{ width: "100%" }}
               />
               
               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentStage}
                   initial={{ y: 10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: -10, opacity: 0 }}
                   className="flex items-center justify-center gap-3 text-purple-700 font-bold"
                 >
                   {stages[currentStage].icon}
                   {stages[currentStage].text}
                 </motion.div>
               </AnimatePresence>
            </div>

            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest pt-4">
              Do not refresh this page
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingModal;
