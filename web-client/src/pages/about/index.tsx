import { Users, Globe, Award, Heart, Plane, Shield, Star, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { id: 'users', icon: Users, value: '2M+', label: 'Happy Travelers' },
    { id: 'countries', icon: Globe, value: '150+', label: 'Countries' },
    { id: 'awards', icon: Award, value: '50+', label: 'Awards Won' },
    { id: 'rating', icon: Star, value: '4.9', label: 'Average Rating' }
  ];

  const values = [
    {
      id: 'passion',
      icon: Heart,
      title: 'Passion for Travel',
      description: 'We believe travel transforms lives and creates lasting memories. Our passion drives us to curate exceptional experiences.'
    },
    {
      id: 'trust',
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Your safety is our priority. We partner with verified providers and maintain the highest safety standards.'
    },
    {
      id: 'global',
      icon: Globe,
      title: 'Global Reach',
      description: 'From hidden gems to iconic destinations, we connect you with authentic experiences worldwide.'
    },
    {
      id: 'innovation',
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to personalize your travel experience and make booking effortless.'
    }
  ];

  const team = [
    {
      id: 'sarah',
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=300&h=300',
      bio: 'Former travel journalist with 15+ years exploring 80+ countries'
    },
    {
      id: 'michael',
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300',
      bio: 'Tech visionary who revolutionized online travel booking platforms'
    },
    {
      id: 'elena',
      name: 'Elena Rodriguez',
      role: 'Head of Experiences',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300',
      bio: 'Adventure enthusiast and cultural immersion specialist'
    },
    {
      id: 'david',
      name: 'David Kim',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300',
      bio: 'Operations expert ensuring seamless travel experiences globally'
    }
  ];

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About TravelX</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make travel accessible, authentic, and unforgettable for everyone. 
            Since 2018, we've been connecting curious travelers with extraordinary experiences around the globe.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <stat.icon className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1488646953014-2616b612b786?auto=format&fit=crop&q=80"
                  alt="Travel inspiration"
                  className="rounded-lg shadow-xl"
                />
              </div>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  TravelX was born from a simple frustration: travel planning was too complicated, 
                  impersonal, and often led to cookie-cutter experiences. Our founders, avid travelers 
                  themselves, knew there had to be a better way.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We started with a vision to democratize travel by making authentic, personalized 
                  experiences accessible to everyone. Today, we're proud to be the platform that 
                  connects millions of travelers with local experts, hidden gems, and life-changing adventures.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Every booking on our platform supports local communities and sustainable tourism practices, 
                  ensuring that travel remains a force for good in the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.id} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                />
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Plane className="h-16 w-16 mx-auto mb-6 text-white/80" />
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed mb-8">
              To inspire and enable meaningful travel experiences that connect people, 
              cultures, and communities while promoting sustainable and responsible tourism practices.
            </p>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-lg italic">
                "Travel is the only thing you buy that makes you richer. We're here to make 
                sure every journey enriches your life and the lives of those you meet along the way."
              </p>
              <p className="mt-4 font-semibold">- Sarah Johnson, CEO & Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join millions of travelers who trust TravelX to create unforgettable experiences
          </p>
          <div className="space-x-4">
            <button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
              Start Planning
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-gray-400 transition-colors font-semibold">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
