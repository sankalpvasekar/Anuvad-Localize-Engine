import { motion } from 'framer-motion';

const Shimmer = () => (
  <motion.div
    animate={{ x: ['-100%', '100%'] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
  />
);

export const StatSkeleton = () => (
  <div className="relative h-48 rounded-[2rem] bg-white/40 backdrop-blur-3xl border border-white/50 p-8 overflow-hidden">
    <Shimmer />
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-gray-200/50 rounded-2xl" />
      <div className="w-16 h-6 bg-gray-200/50 rounded-full" />
    </div>
    <div className="w-24 h-4 bg-gray-200/50 rounded mb-3" />
    <div className="w-12 h-10 bg-gray-200/50 rounded" />
  </div>
);

export const ProjectCardSkeleton = () => (
  <div className="relative rounded-[2rem] bg-white/40 backdrop-blur-3xl border border-white/50 overflow-hidden shadow-sm">
    <Shimmer />
    <div className="aspect-video bg-gray-200/50" />
    <div className="p-7 space-y-4">
      <div className="flex justify-between">
        <div className="w-3/4 h-6 bg-gray-200/50 rounded-lg" />
        <div className="w-6 h-6 bg-gray-200/50 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="w-20 h-4 bg-gray-200/50 rounded" />
        <div className="w-16 h-5 bg-gray-200/50 rounded-full" />
      </div>
    </div>
  </div>
);

export const TaskSkeleton = () => (
  <div className="relative bg-white/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/50 flex items-center gap-8 overflow-hidden">
    <Shimmer />
    <div className="w-16 h-16 bg-gray-200/50 rounded-2xl" />
    <div className="flex-1 space-y-4">
      <div className="flex justify-between">
        <div className="w-1/3 h-6 bg-gray-200/50 rounded-lg" />
        <div className="w-20 h-4 bg-gray-200/50 rounded" />
      </div>
      <div className="h-4 bg-gray-100 rounded-full" />
      <div className="flex justify-between">
        <div className="w-1/4 h-4 bg-gray-200/50 rounded" />
        <div className="w-1/6 h-4 bg-gray-200/50 rounded" />
      </div>
    </div>
    <div className="w-32 h-12 bg-gray-200/50 rounded-2xl" />
  </div>
);
