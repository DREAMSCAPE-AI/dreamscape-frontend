export interface Destination {
  title: string;
  image: string;
  location: string;
  experienceType: string;
  duration: string;
  priceRange: string;
  rating: number;
}

export interface Category {
  name: string;
  image: string;
  experienceCount: number;
}

export interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}