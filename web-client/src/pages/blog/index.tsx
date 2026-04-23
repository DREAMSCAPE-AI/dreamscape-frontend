import BlogSection from '@/components/support/BlogSection';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Blog DreamScape</h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto">
            Inspirations, conseils de voyage et actualités de l'équipe DreamScape.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        <BlogSection />
      </div>
    </div>
  );
}
