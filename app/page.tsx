"use client"
import Layout from '@/components/ReusableComponents/Layout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import HomeVideo from '@/components/HomeVideo'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import { FaSearch, FaAd, FaComments } from 'react-icons/fa'

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Enhanced ActionCard Component with animations
const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description }) => (
  <motion.div 
    className="action-card bg-white dark:bg-[#333333] p-6 shadow-lg rounded-xl text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="icon-wrapper bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-blue-800 dark:text-blue-300">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 flex-grow">{description}</p>
  </motion.div>
);

interface AdType {
  images: string[];
  link?: string;
  title?: string;
}

const Page = () => {
  const [ads, setAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [direction, setDirection] = useState<'left'|'right'>('right');

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/home-page-ads');
      setAds(response.data);
    } catch (error) {
      console.error('Error fetching home page ads:', error);
      toast.error('Failed to load home page ads');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAds();
  }, []);
  
  const nextImage = () => {
    if (ads.length === 0 || !ads[currentAdIndex].images) return;
    setDirection('right');
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % ads[currentAdIndex].images.length
    );
  };
  
  const prevImage = () => {
    if (ads.length === 0 || !ads[currentAdIndex].images) return;
    setDirection('left');
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + ads[currentAdIndex].images.length) % ads[currentAdIndex].images.length
    );
  };

  const nextAd = () => {
    if (ads.length <= 1) return;
    setDirection('right');
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    setCurrentImageIndex(0);
  };

  const prevAd = () => {
    if (ads.length <= 1) return;
    setDirection('left');
    setCurrentAdIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    setCurrentImageIndex(0);
  };
  
  const actionCards = [
    {
      icon: <FaSearch className="text-2xl" />,
      title: 'Browse Listings',
      description: 'Explore our extensive range of categories and find exactly what you\'re looking for.',
    },
    {
      icon: <FaAd className="text-2xl" />,
      title: 'Post an Ad',
      description: 'Create a free listing for items you want to sell or services you offer.',
    },
    {
      icon: <FaComments className="text-2xl" />,
      title: 'Connect and Communicate',
      description: 'Use our messaging system to securely communicate with buyers or sellers.',
    },
  ];
  
  const videoKey = React.useMemo(() => Date.now(), []);

  // Animation variants for the carousel
  const variants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0
    })
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <Layout>
        {/* Promotional Video */}
        <HomeVideo key={videoKey} />
        
        <div className="container mx-auto px-4 py-8">
          <main className="space-y-16">
            {/* Hero Section */}
            <motion.section 
              className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-2xl text-white py-16 px-6 text-center overflow-hidden relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
              <div className="relative z-10 max-w-4xl mx-auto">
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Welcome to <span className="text-blue-300">Klassifies.com</span> –<br />Your Ultimate Classifieds Hub!
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl mb-8 max-w-3xl mx-auto"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Discover a world of opportunities with Klassifies.com, your go-to platform for buying, selling, and connecting in your local community.
                </motion.p>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  
                </motion.div>
              </div>
            </motion.section>

            {/* Get Started Section */}
            <section id="get-started" className="space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-4">Get Started Today!</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Join thousands of satisfied users who are already buying and selling on our platform
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {actionCards.map((card, index) => (
                  <ActionCard
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                  />
                ))}
              </div>
            </section>

            {/* Featured Ads Section */}
            <section id="Home-page-ads" className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-2">Featured Ads</h2>
                <p className="text-gray-600 dark:text-gray-300">Discover premium listings from our community</p>
              </motion.div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : ads.length === 0 ? (
                <motion.div 
                  className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No featured ads available. Contact us to showcase your business here!
                  </p>
                </motion.div>
              ) : (
                <div className="relative max-w-5xl mx-auto">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                    <div className="aspect-w-16 aspect-h-9 relative h-96">
                      <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                          key={`${currentAdIndex}-${currentImageIndex}`}
                          custom={direction}
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className="absolute inset-0"
                        >
                          <Image 
                            src={ads[currentAdIndex].images[currentImageIndex]} 
                            alt="Advertisement"
                            fill
                            className="object-cover"
                            priority
                          />
                        </motion.div>
                      </AnimatePresence>
                      
                      {/* Navigation arrows */}
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-700 rounded-full p-3 shadow-lg z-10 transition-all duration-300 group"
                        aria-label="Previous image"
                      >
                        <FiArrowLeft className="text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xl" />
                      </button>
                      
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-700 rounded-full p-3 shadow-lg z-10 transition-all duration-300 group"
                        aria-label="Next image"
                      >
                        <FiArrowRight className="text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xl" />
                      </button>
                      
                      {/* Ad navigation (if multiple ads) */}
                      {ads.length > 1 && (
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <button 
                            onClick={prevAd}
                            className="bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-700 rounded-full p-2 shadow-md transition-all duration-300"
                            aria-label="Previous ad"
                          >
                            <FiArrowLeft className="text-gray-800 dark:text-gray-200" />
                          </button>
                          <button 
                            onClick={nextAd}
                            className="bg-white/80 hover:bg-white dark:bg-gray-700/80 dark:hover:bg-gray-700 rounded-full p-2 shadow-md transition-all duration-300"
                            aria-label="Next ad"
                          >
                            <FiArrowRight className="text-gray-800 dark:text-gray-200" />
                          </button>
                        </div>
                      )}
                      
                      {/* Dots navigation */}
                      {ads[currentAdIndex].images.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10">
                          {ads[currentAdIndex].images.map((_: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                currentImageIndex === index 
                                  ? 'bg-blue-600 dark:bg-blue-400 scale-110' 
                                  : 'bg-white/50 hover:bg-white/70 dark:bg-gray-500/50 dark:hover:bg-gray-500/70'
                              }`}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Ad Info */}
                    {ads[currentAdIndex].link && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-6 text-center">
                        <a 
                          href={ads[currentAdIndex].link}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-300 group"
                        >
                          Learn More
                          <FiExternalLink className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl text-white py-12 px-6 text-center"
            >
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Join our growing community today and discover a smarter, simpler way to connect.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                
                <a
                  href="/create-ad"
                  className="bg-transparent border-2 border-white hover:bg-white/10 py-3 px-8 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Post an Ad
                </a>
              </div>
            </motion.section>
          </main>
        </div>
      </Layout>

      {/* Global styles for animations */}
      <style jsx global>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E");
        }
        
        .action-card:hover .icon-wrapper {
          transform: rotateY(180deg);
          background-color: #3b82f6;
          color: white;
        }
        
        .icon-wrapper {
          transition: all 0.5s ease;
        }
      `}</style>
    </div>
  )
}

export default Page