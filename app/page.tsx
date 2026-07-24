"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Check, Droplets, Leaf, Mail, Phone, Sparkles } from "lucide-react";
import { TrackButton } from "@/components/TrackButton";
import { NavBar } from "@/components/NavBar";
import { PackSelector } from "@/components/PackSelector";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ProductImageGallery } from "@/components/ProductImageGallery";

function productImage(filename: string) {
  return `/images/${encodeURIComponent(filename)}`;
}

const flavours = [
  {
    id: "guava-chilli",
    name: "Guava Chilli",
    description:
      "Soft guava sweetness upfront. Finished with a mild chilli kick.",
    accent: "#f05a45",
    images: [
      productImage("Guava Chilli 1.png"),
      productImage("Guava Chilli 2.png"),
      productImage("Guava chilli 3.png"),
      productImage("Guava Chilli 4.png"),
      productImage("Guava Chilli 6.png"),
    ],
    splash: "/images/guava-chilli-splash.png",
  },
  {
    id: "raw-mango",
    name: "Raw Mango",
    description:
      "The taste of kachha aam, perfectly chilled. Bright, tangy and mouth-watering",
    accent: "#f2c21b",
    images: [
      productImage("Raw mango pour 1.png"),
      productImage("raw mango pour 2.png"),
      productImage("Raw mango pour 3.png"),
      productImage("raw mango pour 4.png"),
      productImage("raw mango pour 6.png"),
    ],
    splash: "/images/raw-mango-splash.png",
  },
  {
    id: "watermelon",
    name: "Watermelon",
    description:
      "Sweet watermelon with a clean finish. Cool, clean and incredibly smooth.",
    accent: "#ff3030",
    images: [
      productImage("Watermelon Pour 1.png"),
      productImage("Watermelon pour 2.png"),
      productImage("Watermelon pour 3 .png"),
      productImage("Watermelon pour 4.png"),
      productImage("Watermelon pour 6.png"),
    ],
    splash: "/images/watermelon-splash.png",
  }
];

const nutrition = [
  ["Protein", "10g per can"],
  ["Sugar", "0g total sugar"],
  ["Energy", "42 kcal per serving"],
  ["Serve size", "250 ml can"],
  ["Fat", "0g total fat"],
  ["Cholesterol", "0 mg"]
];

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "POUR Protein Water",
  brand: {
    "@type": "Brand",
    name: "POUR"
  },
  description:
    "A zero sugar, low calorie protein water with 10g protein per 250 ml can in Guava Chilli, Raw Mango, and Watermelon flavours.",
  image: flavours.flatMap((flavour) => flavour.images),
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: "149",
    availability: "https://schema.org/InStock"
  }
};

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Load Animations
    const tl = gsap.timeline();
    tl.fromTo(".heroBg",
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }
    )
      .fromTo(".heroContent .eyebrow, .heroContent h1, .heroContent .heroCopy",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" },
        "-=1"
      )
      .fromTo(".heroActions > *",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(".heroStats > div",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      );

    // Scroll Animations for Intro
    gsap.fromTo(".intro > div:first-child",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".intro",
          start: "top 85%",
        }
      }
    );

    gsap.fromTo(".introGrid .feature",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".introGrid",
          start: "top 85%",
        }
      }
    );

    // Scroll Animations for Flavours
    gsap.fromTo(".sectionHeader",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".flavours",
          start: "top 85%",
        }
      }
    );

    gsap.fromTo(".flavourCard",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".flavourGrid",
          start: "top 85%",
        }
      }
    );

    // Scroll Animations for Nutrition
    gsap.fromTo(".nutritionVisual",
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".nutrition",
          start: "top 80%",
        }
      }
    );

    gsap.fromTo(".nutritionContent > *",
      { x: 30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".nutrition",
          start: "top 80%",
        }
      }
    );


    // Contact Section
    gsap.fromTo(".contact > div, .contactActions > *",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact",
          start: "top 85%",
        }
      }
    );
  }, { scope: container });

  return (
    <main ref={container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <section className="hero" id="top">
        <NavBar />

        <div className="heroMedia" aria-hidden="true">
          <Image
            src="/images/guava-chilli-splash.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="heroBg"
          />
        </div>

        <div className="heroContent">
          <p className="eyebrow">CARBONATED PROTEIN WATER - MADE IN INDIA</p>
          <h1>POUR Protein Water</h1>
          <p className="heroCopy">
            Sparkling refreshment with real fruit flavour. Protein, reimagined for everyday drinking.
          </p>
          <div className="heroActions">
            <TrackButton
              className="primaryButton"
              eventName="cta_click"
              eventLabel="hero_enquiry"
              href="#flavours-header"
            >
              Shop now <ArrowRight size={18} aria-hidden="true" />
            </TrackButton>
            {/* <TrackButton
              className="secondaryButton"
              eventName="cta_click"
              eventLabel="hero_flavours"
              href="#contact"
            >
              For Enquiry
            </TrackButton> */}
          </div>
          <dl className="heroStats" aria-label="POUR highlights">
            <div>
              <dt>10g</dt>
              <dd>protein per can</dd>
            </div>
            <div>
              <dt>0g</dt>
              <dd>total sugar</dd>
            </div>
            <div>
              <dt>42</dt>
              <dd>kcal per serving</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="intro section" aria-labelledby="why-pour">
        <div>
          <p className="sectionKicker">Why POUR exists</p>
          <h2 id="why-pour">Protein that drinks like water.</h2>
        </div>
        <div className="introGrid">
          <Feature icon={<Droplets />} title="Light and sparkling" text="Carbonated. Crisp. Clean. Never thick, Never chalky." />
          <Feature icon={<Leaf />} title="Real Ingredients" text="Real fruit. Real flavour. Built around Indian flavours." />
          <Feature icon={<Sparkles />} title="Nothing unnecessary" text="Only what matters. Protein, fruit & carbonated water." />
        </div>
      </section>

      <section className="flavours section" id="flavours" aria-labelledby="flavours-title">
        <div className="sectionHeader" id="flavours-header">
          <p className="sectionKicker">Best served chilled</p>
          <h2 id="flavours-title">Choose your POUR.</h2>
        </div>
        <div className="flavourGrid">
          {flavours.map((flavour) => (
            <article
              className="flavourCard"
              key={flavour.name}
              style={{ "--accent": flavour.accent } as CSSProperties}
            >
              <div className="flavourImage">
                <ProductImageGallery
                  images={flavour.images}
                  alt={`POUR ${flavour.name} protein water can`}
                  accent={flavour.accent}
                />
              </div>
              {/* <p>{flavour.tone}</p> */}
              <h3>{flavour.name}</h3>
              <span className="flavourLine" />
              <p className="flavourText">{flavour.description}</p>
              <PackSelector
                item={{
                  id: flavour.id,
                  name: flavour.name,
                  accent: flavour.accent,
                  image: flavour.images[0],
                }}
              />

            </article>
          ))}
        </div>
      </section>

      <section className="nutrition section" id="nutrition" aria-labelledby="nutrition-title">
        <div className="nutritionVisual">
          <ImageCarousel
            images={[
              productImage("Guava Chilli 5.png"),
              productImage("Raw mango pour 5.png"),
              productImage("Watermelon pour 5.png"),
            ]}
            alt="POUR product lineup"
          />
        </div>
        <div className="nutritionContent">
          <p className="sectionKicker">Nutrition facts</p>
          <h2 id="nutrition-title">Open. Sip. Done.
          </h2>
          <p>
            POUR is made with whey protein isolate - the cleanest protein source available. Crafted to be drunk cold, not mixed, not measured, not thought about. Just opened.
          </p>
          <div className="nutritionGrid">
            {nutrition.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="note">Contains milk. Nutrition information is based on the packaged product.</p>
        </div>
      </section>


      <section className="contact section" id="contact" aria-labelledby="contact-title">
        <div>
          <p className="sectionKicker">Get in Touch</p>
          <h2 id="contact-title">Bring POUR to your customers.</h2>
          <p>
            For retail stocking, distributor partnerships, or bulk orders - get in touch. We are currently onboarding our first retail and distribution partners across India.
          </p>
        </div>
        <div className="contactActions">
          <TrackButton
            className="contactButton"
            eventName="contact_click"
            eventLabel="email"
            href="mailto:hellopourbeverages@gmail.com"
          >
            <Mail size={18} aria-hidden="true" /> hellopourbeverages@gmail.com
          </TrackButton>
          <TrackButton
            className="contactButton"
            eventName="contact_click"
            eventLabel="phone"
            href="tel:+919537242323"
          >
            <Phone size={18} aria-hidden="true" /> +91 95372 42323
          </TrackButton>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
