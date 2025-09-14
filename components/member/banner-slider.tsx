"use client";
import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const banners = [
  {
    image:
      "https://images.pexels.com/photos/2014423/pexels-photo-2014423.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=1000",
    alt: "Promo Gym Unsplash 1",
    link: "#",
  },
  {
    image:
      "https://images.pexels.com/photos/2014450/pexels-photo-2014450.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=1000",
    alt: "Promo Gym Unsplash 2",
    link: "#",
  },
  {
    image:
      "https://images.pexels.com/photos/2014434/pexels-photo-2014434.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=1000",
    alt: "Promo Gym Unsplash 3",
    link: "#",
  },
];

export function BannerSlider() {
  const [api, setApi] = React.useState<any>(null);
  const [selected, setSelected] = React.useState(0);

  // autoplay
  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [api]);

  // update indicator
  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <div className="relative overflow-hidden rounded-b-xl shadow-lg mb-4">
      {/* Overlay gradient top */}
      <div className="absolute top-0 left-0 w-full h-[20%] bg-gradient-to-b from-black/25 to-transparent z-10" />

      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {banners.map((banner, idx) => (
            <CarouselItem key={idx} className="p-0">
              <a href={banner.link} tabIndex={0} className="block h-full w-full">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="h-48 w-full object-cover object-center"
                  draggable={false}
                />
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicator floating di kiri bawah */}
      <div className="absolute bottom-8 left-4 flex gap-2 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            className={`transition-all duration-300 rounded-full ${
              selected === idx
                ? "w-6 h-2 bg-lime-400"
                : "w-2.5 h-2.5 bg-white/50"
            }`}
            onClick={() => api && api.scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
