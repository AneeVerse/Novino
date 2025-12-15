"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';
import { IoIosClose, IoMdChatboxes } from "react-icons/io";
import { MdContentCopy } from 'react-icons/md';

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const [showFloatingButtons, setShowFloatingButtons] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(true);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => setOpen(false))
      .catch((err) => alert('Failed to copy: ' + err));
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll and visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        // Mobile: Show after scrolling down a bit (100px)
        const scrollThreshold = 100;
        if (window.scrollY > scrollThreshold) {
          setShouldShowButton(true);
        } else {
          setShouldShowButton(false);
        }
      } else {
        // Desktop: Always show
        setShouldShowButton(true);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // Also check on resize

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);


  // Force floating buttons to be collapsed on mobile initially
  useEffect(() => {
    if (isMobile) {
      setShowFloatingButtons(false);
    }
  }, [isMobile]);

  // Framer Motion variants for animation
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: {
      scale: 1.1,
      rotate: 360
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[9999] transition-opacity duration-300 ${shouldShowButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {showFloatingButtons && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col items-center gap-3 mb-4"
        >
          <motion.a
            href="https://wa.me/918655644869"
            className="w-14 h-14 bg-white text-[#AE876D] rounded-full flex items-center justify-center shadow-lg border border-[#AE876D] hover:bg-[#AE876D] hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaWhatsapp size={26} />
          </motion.a>

          <motion.a
            href="mailto:business@novino.io"
            className="w-14 h-14 bg-white text-[#AE876D] rounded-full flex items-center justify-center shadow-lg border border-[#AE876D] hover:bg-[#AE876D] hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaEnvelope size={26} />
          </motion.a>

          <motion.a
            href="tel:+918655644869"
            className="w-14 h-14 bg-white text-[#AE876D] rounded-full flex items-center justify-center shadow-lg border border-[#AE876D] hover:bg-[#AE876D] hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPhone size={26} />
          </motion.a>
        </motion.div>
      )}

      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]"
        >
          <motion.div
            className="bg-[#2D2D2D] relative rounded-xl shadow-lg p-8 max-w-md md:max-w-lg w-full text-center mx-4 border border-white/10"
            variants={containerVariants}
          >
            <h2 className="text-2xl font-semibold mb-6 text-white font-['Roboto_Mono']">Get in Touch</h2>
            <motion.button
              className="text-white/70 hover:text-white absolute top-3 right-3 px-1 py-1 rounded-full focus:outline-none transition-colors"
              onClick={() => setOpen(false)}
              whileHover={{ scale: 1.2 }}
            >
              <IoIosClose className="self-center h-8 w-8" />
            </motion.button>
            <div className="flex flex-col gap-5">
              <motion.div
                className="flex items-center justify-between p-4 border border-[#AE876D]/50 rounded-xl hover:border-[#AE876D] transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <a
                  href="https://wa.me/918655644869"
                  className="flex items-center text-[#AE876D] hover:text-[#8d6c58] cursor-pointer transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp size={24} />
                  <span className="ml-3 text-lg font-medium text-white font-['Roboto_Mono']">WhatsApp: +91 8655644869</span>
                </a>
                <motion.button
                  onClick={() => handleCopy('+91 8655644869')}
                  className="text-white/50 hover:text-[#AE876D] focus:outline-none transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <MdContentCopy size={20} />
                </motion.button>
              </motion.div>

              <motion.div
                className="flex items-center justify-between p-4 border border-[#AE876D]/50 rounded-xl hover:border-[#AE876D] transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <a
                  href="mailto:business@novino.io"
                  className="flex items-center text-[#AE876D] hover:text-[#8d6c58] cursor-pointer transition-colors"
                >
                  <FaEnvelope size={24} />
                  <span className="ml-3 text-lg font-medium text-white font-['Roboto_Mono']">Email: business@novino.io</span>
                </a>
                <motion.button
                  onClick={() => handleCopy('business@novino.io')}
                  className="text-white/50 hover:text-[#AE876D] focus:outline-none transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <MdContentCopy size={20} />
                </motion.button>
              </motion.div>

              <motion.div
                className="flex items-center justify-between p-4 border border-[#AE876D]/50 rounded-xl hover:border-[#AE876D] transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <a
                  href="tel:+918655644869"
                  className="flex items-center text-[#AE876D] hover:text-[#8d6c58] cursor-pointer transition-colors"
                >
                  <FaPhone size={24} />
                  <span className="ml-3 text-lg font-medium text-white font-['Roboto_Mono']">Call: +91 8655644869</span>
                </a>
                <motion.button
                  onClick={() => handleCopy('+91 8655644869')}
                  className="text-white/50 hover:text-[#AE876D] focus:outline-none transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <MdContentCopy size={20} />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.button
        className="w-14 h-14 bg-[#AE876D] hover:bg-[#8d6c58] text-white rounded-full flex items-center justify-center shadow-lg shadow-[0_0_20px_rgba(174,135,109,0.5)] hover:shadow-[0_0_30px_rgba(174,135,109,0.7)] focus:outline-none"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={() => {
          if (isMobile) {
            if (showFloatingButtons) {
              setShowFloatingButtons(false);
            } else {
              setShowFloatingButtons(true);
            }
          } else {
            if (showFloatingButtons) {
              setShowFloatingButtons(false);
            } else if (open) {
              setOpen(false);
            } else {
              setShowFloatingButtons(true);
            }
          }
        }}
      >
        <div>
          {open ? (
            <IoIosClose className='self-center h-7 w-7' />
          ) : isMobile && showFloatingButtons ? (
            <IoIosClose className='self-center h-7 w-7' />
          ) : showFloatingButtons ? (
            <IoIosClose className='self-center h-7 w-7' />
          ) : (
            <IoMdChatboxes className="self-center h-8 w-8" />
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
