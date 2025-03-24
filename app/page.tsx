"use client"
import Layout from '@/components/ReusableComponents/Layout'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import HomeVideo from '@/components/HomeVideo'
import Image from 'next/image'
interface ActionCardProps {
  iconClass: string;
  title: string;
  description: string;
}

// Reusable ActionCard Component
const ActionCard: React.FC<ActionCardProps> = ({ iconClass, title, description }) => (
  <div className="action-card dark:bg-[#333333] p-5 shadow-lg rounded-lg text-center">
    <i className={`icon ${iconClass} text-blue-800 mb-3 text-3xl`}></i>
    <h3 className="text-xl font-semibold mb-2 text-blue-800">{title}</h3>
    <p>{description}</p>
  </div>
);

// Define the action card data type
interface ActionCardData {
  iconClass: string;
  title: string;
  description: string;
}

const page = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/home-page-ads');
      console.log("Fetched ads:", response.data); // Log to see the structure
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
  
  // Functions to navigate through carousel
  const nextImage = () => {
    if (ads.length === 0 || !ads[currentAdIndex].images) return;
    
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % ads[currentAdIndex].images.length
    );
  };
  
  const prevImage = () => {
    if (ads.length === 0 || !ads[currentAdIndex].images) return;
    
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + ads[currentAdIndex].images.length) % ads[currentAdIndex].images.length
    );
  };
  
  const actionCards: ActionCardData[] = [
    {
      iconClass: 'browse-icon',
      title: 'Browse Listings',
      description:
        'Explore our extensive range of categories and find exactly what youapos;re looking for.',
    },
    {
      iconClass: 'post-ad-icon',
      title: 'Post an Ad',
      description: 'Create a free listing for items you want to sell or services you offer.',
    },
    {
      iconClass: 'connect-icon',
      title: 'Connect and Communicate',
      description:
        'Use our messaging system to securely communicate with buyers or sellers.',
    },
  ];
  
  // Create a key that changes on each page load to force the component to remount
  const videoKey = React.useMemo(() => Date.now(), []);
  
  return (
    <div>
      <Layout>
        {/* Promotional Video - Using key to force remount on refresh */}
        <HomeVideo key={videoKey} />
        
        <div className="p-3">
          <main className="p-3 space-y-10">
            {/* Header Section */}
            <header className="bg-blue-800 rounded shadow-lg text-white py-10 px-5 text-center">
              <h1 className="text-4xl font-bold mb-3">
                Welcome to <span>Klassifies.com</span> – Your Ultimate Klassifieds Hub!
`              </h1>
              <p className="text-lg">
                Discover a world of opportunities with Klassifies.com, your go-to platform for buying, selling, and connecting in your local community. Whether you're looking to find the perfect item, explore new services, or connect with others nearby, Klassifies.com makes it easy and convenient.
              </p>
            </header>

            <section id="get-started" className="space-y-5 ">
              <h2 className="text-2xl font-bold text-blue-800 text-center">Get Started Today!</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 rounded-lg">
                {actionCards.map((card, index) => (
                  <ActionCard
                    key={index}
                    iconClass={card.iconClass}
                    title={card.title}
                    description={card.description}
                  
                  />
                ))}
              </div>
              <div className="text-center">
                <a
                  href="/listings"
                  className="cta-button bg-blue-800 text-white py-2 px-4 rounded-full font-semibold inline-block mt-5"
                >
                  Start Exploring
                </a>
              </div>
            </section>
            <section id="Home-page-ads" className="space-y-5">
              <h2 className="text-2xl font-bold text-blue-800 text-center">Featured Ads</h2>
              
              {loading ? (
                <div className="text-center py-8">Loading ads...</div>
              ) : ads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Contact Us to Post Your Ads</div>
              ) : (
                <div className="relative max-w-4xl mx-auto">
                  {ads[currentAdIndex]?.images && ads[currentAdIndex].images.length > 0 && (
                    <div className="relative rounded-lg overflow-hidden shadow-xl">
                      {/* Ad Image with transition effect */}
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <Image 
                          src={ads[currentAdIndex].images[currentImageIndex]} 
                          alt="Advertisement"
                          width={100}
                          height={100}
                          className="w-full h-96 object-cover transition-all duration-500 ease-in-out"
                          style={{ transform: 'scale(1.01)' }}
                        />
                        
                        {/* Better Navigation arrows */}
                        <button 
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-800/60 hover:bg-blue-800/90 rounded-full p-3 shadow-md z-10 transition-all duration-300"
                          aria-label="Previous image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-800/60 hover:bg-blue-800/90 rounded-full p-3 shadow-md z-10 transition-all duration-300"
                          aria-label="Next image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                        
                        {/* Improved Dots navigation */}
                        {ads[currentAdIndex].images.length > 1 && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                            {ads[currentAdIndex].images.map((_: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                  currentImageIndex === index 
                                    ? 'bg-white scale-110' 
                                    : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Ad Info with transition */}
                      {ads[currentAdIndex].link && (
                        <div className="bg-white p-4 text-center shadow-inner">
                          <a 
                            href={ads[currentAdIndex].link}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-800 hover:text-blue-600 font-medium transition-colors duration-300 inline-flex items-center"
                          >
                            Learn More
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
            {/* Footer Section */}
            <footer className="community-invite bg-blue-800 rounded text-white py-10 px-5 text-center">
              <p className="mb-3">
                Join our growing community today and discover a smarter, simpler way to connect.
              </p>
              <p className="font-bold">
                Start exploring or posting your ads now – it&apos;s completely free!
              </p>
            </footer>
          </main>
        </div>
      </Layout>
    </div>
  )
}

export default page
