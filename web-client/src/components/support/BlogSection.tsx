import React from 'react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

const BlogSection = () => {
  const posts = [
    {
      title: "Top Hidden Gems in Southeast Asia",
      excerpt: "Discover lesser-known destinations that offer unique cultural experiences and breathtaking views...",
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80",
      author: "Sarah Johnson",
      date: "Feb 15, 2024",
      tags: ["Adventure", "Culture"]
    },
    {
      title: "Sustainable Travel Guide 2024",
      excerpt: "Learn how to minimize your environmental impact while exploring the world...",
      image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80",
      author: "Mike Chen",
      date: "Feb 12, 2024",
      tags: ["Eco-Friendly", "Tips"]
    },
    {
      title: "Using AI to Plan Your Perfect Trip",
      excerpt: "How artificial intelligence is revolutionizing the way we plan and experience travel...",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80",
      author: "Emma Davis",
      date: "Feb 10, 2024",
      tags: ["Technology", "Planning"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Featured Post */}
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80"
          alt="Featured post"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 text-white/80 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Feb 20, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Alex Thompson</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              The Future of Travel: AI and Virtual Reality
            </h2>
            <p className="text-white/80 mb-6">
              Explore how emerging technologies are transforming the way we discover and experience destinations...
            </p>
            <button className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
              <span>Read More</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogSection;