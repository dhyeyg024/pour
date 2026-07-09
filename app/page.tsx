import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, Check, Droplets, Leaf, Mail, Phone, Sparkles } from "lucide-react";
import { TrackButton } from "@/components/TrackButton";
import { NavBar } from "@/components/NavBar";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ImageCarousel } from "@/components/ImageCarousel";

const flavours = [
  {
    id: "guava-chilli",
    name: "Guava Chilli",
    tone: "Spicy tropical",
    description:
      "Pink guava freshness with a clean chilli finish for people who like their hydration with a little spark.",
    accent: "#f05a45",
    image: "/images/guava-chilli-hero.png",
    splash: "/images/guava-chilli-splash.png",
    price: 150
  },
  {
    id: "raw-mango",
    name: "Raw Mango",
    tone: "Tangy bright",
    description:
      "Sharp green mango notes, citrusy lift, and a crisp finish built for hot afternoons and post-workout resets.",
    accent: "#f2c21b",
    image: "/images/raw-mango-hero.png",
    splash: "/images/raw-mango-splash.png",
    price: 150
  },
  {
    id: "watermelon",
    name: "Watermelon",
    tone: "Juicy light",
    description:
      "A cool watermelon profile with a refreshing fruit-water feel and a clean zero-sugar finish.",
    accent: "#ff3030",
    image: "/images/watermelon-hero.png",
    splash: "/images/watermelon-splash.png",
    price: 150
  }
];

const nutrition = [
  ["Protein", "10g per can"],
  ["Sugar", "0g total sugar"],
  ["Energy", "42 kcal per serving"],
  ["Serve size", "250 ml can"],
  ["Fat", "0g total fat"],
  ["Cholesterol", "0mg"]
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
  image: [
    "/images/guava-chilli-hero.png",
    "/images/raw-mango-hero.png",
    "/images/watermelon-hero.png"
  ],
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: "150",
    availability: "https://schema.org/InStock"
  }
};

export default function Home() {
  return (
    <main>
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
          <p className="eyebrow">Protein water made for more</p>
          <h1>POUR Protein Water</h1>
          <p className="heroCopy">
            A refreshing way to add protein to your day. Clean nutrition, real fruit
            flavour, zero sugar, and 10g protein in every chilled can.
          </p>
          <div className="heroActions">
            <TrackButton
              className="primaryButton"
              eventName="cta_click"
              eventLabel="hero_enquiry"
              href="#contact"
            >
              Enquire now <ArrowRight size={18} aria-hidden="true" />
            </TrackButton>
            <TrackButton
              className="secondaryButton"
              eventName="cta_click"
              eventLabel="hero_flavours"
              href="#flavours"
            >
              View flavours
            </TrackButton>
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
          <p className="sectionKicker">Clean refreshment</p>
          <h2 id="why-pour">Protein that drinks like water.</h2>
        </div>
        <div className="introGrid">
          <Feature icon={<Droplets />} title="Light and sparkling" text="Carbonated protein water designed to feel crisp, not heavy." />
          <Feature icon={<Leaf />} title="Real fruit flavour" text="Fruit-led profiles across guava chilli, raw mango, and watermelon." />
          <Feature icon={<Sparkles />} title="Nothing unnecessary" text="Zero sugar, low calorie, and easy to drink chilled." />
        </div>
      </section>

      <section className="flavours section" id="flavours" aria-labelledby="flavours-title">
        <div className="sectionHeader">
          <p className="sectionKicker">Three flavours</p>
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
                <Image
                  src={flavour.image}
                  alt={`POUR ${flavour.name} protein water can`}
                  fill
                  sizes="(max-width: 760px) 82vw, 30vw"
                  loading="lazy"
                />
              </div>
              <p>{flavour.tone}</p>
              <h3>{flavour.name}</h3>
              <span className="flavourLine" />
              <p className="flavourText">{flavour.description}</p>
              <div className="flavourCardFooter">
                <span className="flavourPrice">₹{flavour.price} / can</span>
                <AddToCartButton
                  item={{
                    id: flavour.id,
                    name: flavour.name,
                    accent: flavour.accent,
                    image: flavour.image,
                    price: flavour.price
                  }}
                />
              </div>
              <TrackButton
                className="textButton"
                eventName="flavour_interest"
                eventLabel={flavour.name}
                href="#contact"
              >
                Ask for {flavour.name} <ArrowRight size={16} aria-hidden="true" />
              </TrackButton>
            </article>
          ))}
        </div>
      </section>

      <section className="nutrition section" id="nutrition" aria-labelledby="nutrition-title">
        <div className="nutritionVisual">
          <ImageCarousel
            images={[
              "/images/raw-mango-lineup.png",
              "/images/guava-chilli-lineup.png",
              "/images/watermelon-lineup.png"
            ]}
            alt="POUR product lineup"
          />
        </div>
        <div className="nutritionContent">
          <p className="sectionKicker">Nutrition facts</p>
          <h2 id="nutrition-title">Built for everyday protein, without sugar.</h2>
          <p>
            POUR is made with whey protein isolate and crafted as a refreshing,
            fruit-flavoured protein water. Enjoy chilled and shake gently.
          </p>
          <div className="nutritionGrid">
            {nutrition.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="note">Contains milk. Nutrition values are based on product pack information.</p>
        </div>
      </section>

      <section className="adReady section" aria-labelledby="ad-ready-title">
        <div>
          <p className="sectionKicker">Ready for performance marketing</p>
          <h2 id="ad-ready-title">Made to measure visitor intent.</h2>
          <p>
            The site already includes click events for enquiries, flavour interest,
            and primary calls to action through a data layer. Google Tag Manager,
            Meta Pixel, Google Ads, or analytics tools can be added without changing
            the page structure.
          </p>
        </div>
        <ul>
          <li><Check size={18} aria-hidden="true" /> SEO metadata and product schema</li>
          <li><Check size={18} aria-hidden="true" /> Campaign-friendly call-to-action tracking</li>
          <li><Check size={18} aria-hidden="true" /> Fast static-first Next.js landing page</li>
        </ul>
      </section>

      <section className="contact section" id="contact" aria-labelledby="contact-title">
        <div>
          <p className="sectionKicker">Contact</p>
          <h2 id="contact-title">Bring POUR to your customers.</h2>
          <p>
            For retail, distributor, sampling, or bulk enquiries, contact POUR Beverages.
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
