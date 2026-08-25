import React from 'react';
import { ExternalLink, Package, Sparkles, Truck, CheckCircle2, Clock3 } from 'lucide-react';

type Product = {
  sku: string;
  name: string;
  collection: 'Heritage Core' | 'Studio Collection';
  finish: string;
  description: string;
  supplier: string;
  fulfilment: string;
  status: 'Testing' | 'Supplier ready' | 'Local production';
  price?: string;
  costNote?: string;
  artwork: string;
  featured?: boolean;
};

const products: Product[] = [
  {
    sku: 'HCM-HOOD-PRT',
    name: 'Heritage Hoodie',
    collection: 'Heritage Core',
    finish: 'Printed',
    description: 'The HCM hero garment — a substantial white hoodie carrying the full Heritage Craft Media turtle artwork.',
    supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand',
    status: 'Testing',
    artwork: 'hcm-hood-prt',
    featured: true,
  },
  {
    sku: 'HCM-HOOD-EMB',
    name: 'Heritage Hoodie — Studio Edition',
    collection: 'Studio Collection',
    finish: 'Embroidered',
    description: 'Premium local version using the simplified HCM mark. Intended for the Bordon workwear supplier once the final price is agreed.',
    supplier: 'Bordon workwear supplier',
    fulfilment: 'Local production',
    status: 'Local production',
    artwork: 'hcm-hood-emb',
  },
  {
    sku: 'HCM-APRN-PRT',
    name: 'HCM Workshop Apron',
    collection: 'Heritage Core',
    finish: 'Printed',
    description: 'A practical workshop apron designed for makers, studios and craft businesses.',
    supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand',
    status: 'Testing',
    artwork: 'hcm-aprn-prt',
  },
  {
    sku: 'HCM-MUG-PRT',
    name: 'Heritage Mug',
    collection: 'Heritage Core',
    finish: 'Printed',
    description: 'An everyday HCM mug for the workshop, studio or office.',
    supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand',
    status: 'Testing',
    artwork: 'hcm-mug-prt',
  },
  {
    sku: 'HCM-PEN',
    name: 'Studio Pen',
    collection: 'Studio Collection',
    finish: 'Branded',
    description: 'A premium studio essential for notes, ideas and client conversations. Supplier and final retail price will be confirmed before launch.',
    supplier: 'Specialist supplier — compare local and online options',
    fulfilment: 'Supplier fulfilment / stocked option',
    status: 'Supplier ready',
    price: undefined,
    costNote: 'Current supplier information recorded: £145 minimum quantity 1 + £10 branding + £3.50 delivery, VAT included. Retail price still to be set.',
    artwork: 'hcm-pen-prt',
  },
  {
    sku: 'HCM-JRNL',
    name: 'Studio Linen Journal',
    collection: 'Studio Collection',
    finish: 'Printed',
    description: 'A tactile hardcover journal for ideas, stories, sketches and workshop notes.',
    supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand',
    status: 'Testing',
    artwork: 'hcm-jrnl-prt',
  },
  {
    sku: 'HCM-TOTE-PRT',
    name: 'Heritage Canvas Tote',
    collection: 'Heritage Core',
    finish: 'Printed',
    description: 'A useful heavy canvas carry bag with the HCM identity built for everyday use.',
    supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand',
    status: 'Testing',
    artwork: 'hcm-tote-prt',
  },
];

const statusStyles = {
  Testing: { icon: Clock3, label: 'Sample being tested' },
  'Supplier ready': { icon: CheckCircle2, label: 'Ready for final pricing' },
  'Local production': { icon: CheckCircle2, label: 'Local supplier route' },
};

export default function Merchandise() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-olive/10 text-brand-olive text-sm font-bold mb-6">
            <Sparkles size={16} /> HCM Merchandise
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-brand-ink tracking-tight">
            A small range. Properly chosen.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-ink/70 leading-relaxed">
            We are not tying HCM to one supplier. Each product gets the best production route we can find — local where it makes sense, print-on-demand where it works, and stocked products where buying in gives us the better result.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const StatusIcon = statusStyles[product.status].icon;
            return (
              <article
                key={product.sku}
                className={`group rounded-3xl border border-brand-olive/15 bg-white/80 p-6 shadow-sm hover:shadow-lg transition-all ${product.featured ? 'lg:col-span-2' : ''}`}
              >
                <div className="aspect-[4/3] rounded-2xl bg-brand-ink/5 flex items-center justify-center overflow-hidden border border-brand-ink/5">
                  <div className="text-center px-6">
                    <Package className="mx-auto text-brand-olive/50 mb-3" size={42} />
                    <p className="text-sm font-bold text-brand-ink/40">PRODUCT IMAGE</p>
                    <p className="text-xs text-brand-ink/30 mt-1">Supplier-approved artwork/mock-up goes here</p>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-olive">{product.collection}</span>
                    <span className="text-xs font-semibold text-brand-ink/50">{product.finish}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-brand-ink">{product.name}</h2>
                  <p className="mt-3 text-brand-ink/65 leading-relaxed">{product.description}</p>

                  <div className="mt-5 rounded-2xl bg-brand-cream/70 p-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Truck size={16} className="mt-0.5 text-brand-olive shrink-0" />
                      <span><strong>Route:</strong> {product.supplier}</span>
                    </div>
                    <div className="text-brand-ink/60"><strong>Fulfilment:</strong> {product.fulfilment}</div>
                    <div className="text-brand-ink/60"><strong>SKU:</strong> {product.sku}</div>
                  </div>

                  {product.costNote && (
                    <p className="mt-4 text-xs text-brand-ink/55 leading-relaxed">{product.costNote}</p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink/60">
                      <StatusIcon size={15} /> {statusStyles[product.status].label}
                    </span>
                    <span className="text-xs font-bold tracking-wider text-brand-ink/35">{product.artwork}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-brand-olive/15 bg-brand-olive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="font-bold text-brand-olive">1. Choose the blank</p>
              <p className="mt-2 text-sm text-brand-ink/65">We record the exact product, material, colour, size, print area and supplier before creating the final artwork.</p>
            </div>
            <div>
              <p className="font-bold text-brand-olive">2. Apply HCM branding</p>
              <p className="mt-2 text-sm text-brand-ink/65">The standalone turtle and Studio mark remain the core brand assets. Product-specific artwork is prepared only after the actual blank is chosen.</p>
            </div>
            <div>
              <p className="font-bold text-brand-olive">3. Connect fulfilment</p>
              <p className="mt-2 text-sm text-brand-ink/65">Once price and supplier are approved, the product can be connected to Stripe checkout and its fulfilment route.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-brand-ink text-white p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold">Supplier-first, not supplier-locked.</h2>
              <p className="mt-2 text-white/70 max-w-2xl">Prodigi is our starting point for the printed range. Digitus/APS can cover local print and packaging, the Bordon supplier can handle premium workwear, and other suppliers can be added whenever they give us a better product.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 text-white font-bold text-sm shrink-0">
              <CheckCircle2 size={17} /> HCM catalogue structure ready
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
