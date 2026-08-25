import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Package, Sparkles } from 'lucide-react';

const products = [
  {
    name: 'Heritage Hoodie',
    category: 'Heritage Core',
    finish: 'Printed',
    description: 'The HCM hero garment — a heavyweight hoodie designed around the Heritage Craft Media turtle mark.',
    status: 'Initial product',
  },
  {
    name: 'Heritage Hoodie — Studio Edition',
    category: 'Studio Collection',
    finish: 'Embroidered',
    description: 'Premium embroidered version, intended for local workwear production in Bordon.',
    status: 'Local supplier',
  },
  {
    name: 'HCM Workshop Apron',
    category: 'Heritage Core',
    finish: 'Printed',
    description: 'A practical workshop apron carrying the HCM identity for makers and craft businesses.',
    status: 'Initial product',
  },
  {
    name: 'Heritage Mug',
    category: 'Heritage Core',
    finish: 'Printed',
    description: 'A substantial everyday mug for the HCM workshop, studio or office.',
    status: 'Initial product',
  },
  {
    name: 'Studio Pen',
    category: 'Studio Collection',
    finish: 'Printed',
    description: 'A simple branded studio essential for notes, ideas and client conversations.',
    status: 'Initial product',
  },
  {
    name: 'Studio Linen Journal',
    category: 'Studio Collection',
    finish: 'Printed',
    description: 'A tactile journal for ideas, stories, sketches and the things makers do not want to forget.',
    status: 'Initial product',
  },
  {
    name: 'Heritage Canvas Tote',
    category: 'Heritage Core',
    finish: 'Printed',
    description: 'A useful heavy canvas carry bag with the HCM identity built for everyday use.',
    status: 'Initial product',
  },
];

export default function Merchandise() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-olive/10 text-brand-olive text-sm font-bold mb-6">
            <Sparkles size={16} /> HCM Merchandise
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-brand-ink tracking-tight">
            Made for the workshop, the studio and the journey.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-ink/70 leading-relaxed">
            A small, carefully chosen HCM range rather than a wall of random promotional products. We will test the real products first, then keep the ones worth selling.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <article
              key={product.name}
              className={`group rounded-3xl border border-brand-olive/15 bg-white/70 p-6 shadow-sm hover:shadow-lg transition-all ${index === 0 ? 'lg:col-span-2' : ''}`}
            >
              <div className="aspect-[4/3] rounded-2xl bg-brand-ink/5 flex items-center justify-center overflow-hidden">
                <div className="text-center px-6">
                  <Package className="mx-auto text-brand-olive/50 mb-3" size={42} />
                  <p className="text-sm font-bold text-brand-ink/40">PRODUCT IMAGE</p>
                  <p className="text-xs text-brand-ink/30 mt-1">Add approved supplier photography here</p>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-olive">{product.category}</span>
                  <span className="text-xs font-semibold text-brand-ink/50">{product.finish}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-brand-ink">{product.name}</h2>
                <p className="mt-3 text-brand-ink/65 leading-relaxed">{product.description}</p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-brand-ink/50">{product.status}</span>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-ink/10 text-brand-ink/40 text-sm font-bold cursor-not-allowed"
                    title="Checkout will be connected after the supplier and final product are approved"
                  >
                    Coming soon <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-olive/15 bg-brand-olive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-brand-olive">1. Test</p>
            <p className="mt-2 text-sm text-brand-ink/65">We order samples and check the actual garment, print, finish and quality.</p>
          </div>
          <div>
            <p className="font-bold text-brand-olive">2. Choose</p>
            <p className="mt-2 text-sm text-brand-ink/65">Prodigi is the initial holding/fulfilment option, but we can use the best supplier for each product.</p>
          </div>
          <div>
            <p className="font-bold text-brand-olive">3. Sell</p>
            <p className="mt-2 text-sm text-brand-ink/65">Once a product is approved, we connect its checkout and fulfilment route rather than guessing beforehand.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-brand-ink text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Want to see the wider HCM range?</h2>
            <p className="mt-2 text-white/70">Go back to the main HCM site and explore the studio, academy and services.</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-brand-ink font-bold hover:bg-white/90 transition-colors">
            Back to HCM <ExternalLink size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
