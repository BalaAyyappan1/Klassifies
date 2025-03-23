import DisplayTopBar from '@/components/Admin/TopBar/DisplayTopBar';
import Layout from '@/components/ReusableComponents/Layout'
import React from 'react'

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
  const actionCards: ActionCardData[] = [
    {
      iconClass: 'browse-icon',
      title: 'Browse Listings',
      description:
        'Explore our extensive range of categories and find exactly what you’re looking for.',
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
  
  return (
    <div >
      <Layout>
      <div className="p-3">
      <main className="p-3 space-y-10">
        {/* Header Section */}
        <header className="bg-blue-800 rounded shadow-lg text-white py-10 px-5 text-center">
          <h1 className="text-4xl font-bold mb-3">
            Welcome to <span>Klassifies.com</span> – Your Ultimate Klassifieds Hub!
          </h1>
          <p className="text-lg">
            Discover a world of opportunities with Klassifies.com, your go-to platform for buying, selling, and connecting in your local community. Whether you’re looking to find the perfect item, explore new services, or connect with others nearby, Klassifies.com makes it easy and convenient.
          </p>
        </header>

        <section id="get-started" className="space-y-5">
          <h2 className="text-2xl font-bold text-blue-800 text-center">Get Started Today!</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 ">
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

        {/* Footer Section */}
        <footer className="community-invite bg-blue-800 rounded text-white py-10 px-5 text-center">
          <p className="mb-3">
            Join our growing community today and discover a smarter, simpler way to connect.
          </p>
          <p className="font-bold">
            Start exploring or posting your ads now – it’s completely free!
          </p>
        </footer>
      </main>
      </div>
      </Layout>
      
    </div>
  )
}

export default page
