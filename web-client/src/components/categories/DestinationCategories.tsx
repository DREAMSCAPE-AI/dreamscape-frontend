import React from 'react';
import CategoryCard from './CategoryCard';
import SectionTitle from '../shared/SectionTitle';

const categories = [
  {
    name: "Adventure Travel",
    image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80",
    experienceCount: 42
  },
  {
    name: "Cultural Experiences",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80",
    experienceCount: 56
  },
  {
    name: "Food & Wine",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
    experienceCount: 38
  },
  {
    name: "Wellness Retreats",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80",
    experienceCount: 24
  },
  {
    name: "Urban Exploration",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80",
    experienceCount: 45
  },
  {
    name: "Eco Tourism",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80",
    experienceCount: 31
  }
];

const DestinationCategories = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto px-4">
        <SectionTitle 
          title="Explore by Category"
          subtitle="Find your perfect adventure"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {categories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationCategories;