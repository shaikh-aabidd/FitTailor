import React from 'react';
import MainLayout from '../layouts/MainLayout';
import {
  HeroBanner,
  CategoryScroller,
  InfoSection,
  StepsList,
  ProductGrid,
  TestimonialCarousel,
  NewsletterSignup
} from "../components"

import { useGetAllProductsQuery } from '../features/api/product.api';

const HomePage = () => {
  const { data: prodData } = useGetAllProductsQuery({ page: 1, limit: 4 });
  const products = prodData?.docs || [];
  // console.log("prodData",products)
  return (
      <>
        <HeroBanner />
        <CategoryScroller />
        <InfoSection />
        <StepsList />
        <ProductGrid products={products} />
        <TestimonialCarousel />
        <NewsletterSignup />
     </>
  );
};

export default HomePage;