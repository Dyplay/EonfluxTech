'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowRight } from 'react-icons/fi';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'values' | 'team'>('mission');
  
  // Team members data
  const teamMembers = [
    {
      name: "Marco Rivero Alvarez",
      role: "Founder & Lead Developer",
      image: "/team/dyplay_0e39c814ab49bf772c9f099a921d623d.jpg",
      bio: "Loves Programming Website with Next.js and Tailwind CSS and loves to learn new things.",
      links: {
        github: "https://github.com/dyplay",
        twitter: "https://twitter.com/dyplayr",
        linkedin: "https://linkedin.com/in/marco-rivero-alvarez"
      }
    },
    {
      name: "Lauren Derrick",
      role: "Developer",
      image: "/team/Fqll3n_ang3l_jinx-goggles.gif",
      bio: "Major fan of Jinx from arcane, And loves coding!",
      links: {
        github: "https://github.com/DreamyzLovez"
      }
    },
  ];
  
  // Timeline events
  const timelineEvents = [
    {
      year: "2025",
      title: "EonfluxTech Idea",
      description: "EonfluxTech was founded with a vision to create accessible open-source software. This is where the journey begins."
    },
  ];
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/50 to-background">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About EonfluxTech</h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're building the future of open source software, one line of code at a time.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  EonfluxTech began with a simple idea: create software that's both powerful and accessible. 
                  Founded by a group of developers passionate about open source, we set out to build tools 
                  that empower other developers and enhance the digital experience for everyone.
                </p>
                <p>
                  Our journey started with small contributions to existing open-source projects, 
                  but quickly evolved into developing our own solutions to address gaps we identified 
                  in the software ecosystem.
                </p>
                <p>
                  Today, we're proud to maintain several open-source projects used by developers 
                  around the world, and we're constantly working on new innovations that push 
                  the boundaries of what's possible.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative h-[400px] rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src="/about_hero2.jpg"
                alt="Our journey"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Mission, Values, Team Tabs */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap border-b border-border mb-8">
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'mission' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Our Mission
            </button>
            <button
              onClick={() => setActiveTab('values')}
              className={`px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'values' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Our Values
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-3 font-medium text-lg transition-colors ${
                activeTab === 'team' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Our Team
            </button>
          </div>
          
          {/* Mission Tab */}
          {activeTab === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-12"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    At EonfluxTech, our mission is to create universal and simple software that empowers 
                    developers and users alike. We believe in the power of open source to drive innovation 
                    and make technology more accessible to everyone.
                  </p>
                  <p>
                    We're committed to building tools that solve real problems, are easy to use, 
                    and foster a collaborative community of contributors and users.
                  </p>
                  <p>
                    By focusing on quality, usability, and community engagement, we aim to make 
                    a positive impact on the software ecosystem and help shape the future of 
                    technology.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4">Our Journey</h3>
                <div className="space-y-8">
                  {timelineEvents.map((event, index) => (
                    <motion.div 
                      key={event.year}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      className="relative pl-8 border-l border-primary/30"
                    >
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <div className="text-sm text-primary font-medium mb-1">{event.year}</div>
                      <h4 className="text-lg font-semibold mb-1">{event.title}</h4>
                      <p className="text-muted-foreground">{event.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Values Tab */}
          {activeTab === 'values' && (
            <motion.div
              key="values"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-center">Our Core Values</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Open Collaboration",
                    description: "We believe in the power of community and open collaboration. By working together, we can create better software and solve more complex problems.",
                    icon: (
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )
                  },
                  {
                    title: "Simplicity & Usability",
                    description: "We strive to create software that's intuitive and easy to use. Complexity should be hidden, not exposed to the user.",
                    icon: (
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )
                  },
                  {
                    title: "Continuous Innovation",
                    description: "We're always looking for new ways to improve and innovate. Standing still means falling behind in the fast-paced world of technology.",
                    icon: (
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )
                  },
                  {
                    title: "Quality & Reliability",
                    description: "We're committed to building software that's reliable, secure, and performs well. Quality is never an accident; it's the result of intelligent effort.",
                    icon: (
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )
                  },
                  {
                    title: "Inclusivity & Accessibility",
                    description: "We design our software to be accessible to everyone, regardless of their background, abilities, or resources.",
                    icon: (
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    )
                  },
                  {
                    title: "Transparency & Trust",
                    description: "We operate with transparency in everything we do. Our code is open source, our processes are documented, and we communicate openly with our community.",
                    icon: (
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )
                  }
                ].map((value, index) => (
                  <motion.div
                    key={value.title}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4">{value.icon}</div>
                    <h4 className="text-xl font-semibold mb-2">{value.title}</h4>
                    <p className="text-muted-foreground">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Team Tab */}
          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-center">Meet Our Team</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.name}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-64 w-full">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6 flex flex-col h-[calc(100%-16rem)]">
                      <div className="flex-grow">
                        <h4 className="text-xl font-semibold mb-1">{member.name}</h4>
                        <p className="text-primary text-sm mb-3">{member.role}</p>
                        <p className="text-muted-foreground">{member.bio}</p>
                      </div>
                      <div className="flex space-x-3 pt-4 mt-auto">
                        {member.links.github && (
                          <Link href={member.links.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <FiGithub className="h-5 w-5" />
                          </Link>
                        )}
                        {member.links.twitter && (
                          <Link href={member.links.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <FiTwitter className="h-5 w-5" />
                          </Link>
                        )}
                        {member.links.linkedin && (
                          <Link href={member.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <FiLinkedin className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  We're always looking for talented individuals to join our team.
                </p>
                <Link 
                  href="/careers" 
                  className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Join Our Team
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              Have questions about our projects or interested in collaborating? We'd love to hear from you!
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="mailto:contact@eonfluxtech.com" 
                className="flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <FiMail className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
              <Link 
                href="https://github.com/EonfluxTech-com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                <FiGithub className="mr-2 h-5 w-5" />
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 