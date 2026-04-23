import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

interface BlogPost { title: string; excerpt: string; author: string; date: string; tags: string[] }

const BlogSection = () => {
  const { t } = useTranslation('support');
  const posts = t('blog.posts', { returnObjects: true }) as BlogPost[];
  const featured = t('blog.featured', { returnObjects: true }) as { title: string; excerpt: string };

  return (
    <div className="space-y-8">
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80"
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 text-white/80 mb-4">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>20 fév. 2024</span></div>
              <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>Alex Thompson</span></div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">{featured.title}</h2>
            <p className="text-white/80 mb-6">{featured.excerpt}</p>
            <button className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
              <span>{t('blog.readMore')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={[
                  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
                ][i]}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, ti) => (
                  <span key={ti} className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{post.author}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{post.date}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogSection;
