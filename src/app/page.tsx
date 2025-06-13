import React from "react";
import ChatBox from "@/components/ui/ChatBox";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import * as motion from "motion/react-client";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <BackgroundGradientAnimation>
        <div className="absolute z-10 inset-0 flex flex-col items-center justify-center text-slate-800 font-bold px-4 text-3xl text-center md:text-4xl lg:text-7xl">
          <motion.div
            className="z-30"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
            whileHover={{
              scale: 1.2,
              opacity: 1,
              transition: { duration: 0.3 },
            }}
            drag
            whileDrag={{ scale: 1.8, opacity: 0.5 }}
            dragSnapToOrigin>
            <motion.h1 className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20 pointer-events-none">
              Medical Chatbot
            </motion.h1>
          </motion.div>
          <motion.div
            className="z-20 w-full max-w-6xl mx-auto mt-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeInOut" }}
            drag
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.1 },
            }}
            whileDrag={{ scale: 1.1, opacity: 0.5 }}
            dragSnapToOrigin>
            <ChatBox />
          </motion.div>
        </div>
      </BackgroundGradientAnimation>
    </div>
  );
}
