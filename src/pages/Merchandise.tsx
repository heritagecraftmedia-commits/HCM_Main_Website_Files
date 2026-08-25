import React from 'react';
import { ExternalLink, Package, Sparkles, Truck, CheckCircle2, Clock3, Database, Download } from 'lucide-react';

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
  image?: string;
  supplierUrl?: string;
  supplierRef?: string;
  featured?: boolean;
};

const products: Product[] = [
  {
    sku: 'HCM-HOOD-PRT', name: 'Heritage Hoodie', collection: 'Heritage Core', finish: 'Printed',
    description: 'The HCM hero garment — a substantial hoodie carrying the Heritage Craft Media branding.',
    supplier: 'Prodigi — initial fulfilment option', fulfilment: 'Print on demand', status: 'Testing',
    image: 'https://www.fluidbranding.com/media/catalog/product/cache/5d8e184087b91b8c6788f82b1ec6b2b1/O/6/O63101.jpg', artwork: 'hcm-hood-prt', featured: true,
  },
  {
    sku: 'HCM-HOOD-FLUID', name: 'Fairtrade & Organic Cotton Hoodie', collection: 'Studio Collection', finish: 'Branded',
    description: '300gsm 100% GOTS Certified Organic Fairtrade Cotton hoodie. Vegan approved and made using renewable energy.',
    supplier: 'Fluid Branding', fulfilment: 'Supplier purchase / local or stocked fulfilment', status: 'Supplier ready',
    price: 'From £36.24 ex VAT', costNote: 'Fluid ref 13265140. MOQ 25. Branding price shown at £49.32 each for 25; carriage and artwork setup extra.',
    image: 'https://www.fluidbranding.com/media/catalog/product/cache/3efeb05dfec8654ab6e77ba9a770b7da/O/6/O63101.jpg', supplierRef: '13265140',
    supplierUrl: 'https://www.fluidbranding.com/fairtrade-organic-cotton-hoodie-13265140.html', artwork: 'hcm-hood-fluid',
  },
  {
    sku: 'HCM-HOOD-FLUID-L', name: 'Ladies Fairtrade & Organic Cotton Hoodie', collection: 'Studio Collection', finish: 'Branded',
    description: '300gsm 100% GOTS Certified Organic Fairtrade Cotton ladies hoodie. Vegan approved.',
    supplier: 'Fluid Branding', fulfilment: 'Supplier purchase / local or stocked fulfilment', status: 'Supplier ready',
    price: 'From £36.24 ex VAT', costNote: 'Fluid ref 13265141. MOQ 25. Branding price shown at £49.32 each for 25; carriage and artwork setup extra.',
    image: 'https://www.fluidbranding.com/media/catalog/product/cache/3efeb05dfec8654ab6e77ba9a770b7da/O/8/O83101.jpg', supplierRef: '13265141',
    supplierUrl: 'https://www.fluidbranding.com/ladies-fairtrade-organic-cotton-hoodie-13265141.html', artwork: 'hcm-hood-fluid-l',
  },
  {
    sku: 'HCM-APRN-PRT', name: 'HCM Workshop Apron', collection: 'Heritage Core', finish: 'Printed',
    description: 'A practical workshop apron designed for makers, studios and craft businesses.',
    supplier: 'Bordon workwear supplier', fulfilment: 'Local production', status: 'Local production', artwork: 'hcm-aprn-prt',
  },
  {
    sku: 'HCM-MUG-PRT', name: 'Heritage Mug', collection: 'Heritage Core', finish: 'Printed',
    description: 'An everyday HCM mug for the workshop, studio or office.', supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand', status: 'Testing', artwork: 'hcm-mug-prt',
  },
  {
    sku: 'HCM-PEN', name: 'Studio Pen', collection: 'Studio Collection', finish: 'Branded',
    description: 'A premium studio essential for notes, ideas and client conversations.', supplier: 'Fluid Branding / specialist supplier comparison',
    fulfilment: 'Supplier fulfilment / stocked option', status: 'Supplier ready',
    price: 'Supplier guide price from £0.57 ex VAT', costNote: 'Fluid ref 13201837. MOQ 180. Fluid notes a £20 decoration setup cost; final quote required. Pen Heaven Parker option is also recorded separately for premium gifting.',
    image: 'https://www.fluidbranding.com/media/catalog/product/cache/3efeb05dfec8654ab6e77ba9a770b7da/r/e/recycled-aluminium-ball-pen-orange-item-picture-front_1.jpg', supplierRef: '13201837',
    supplierUrl: 'https://www.fluidbranding.com/bern-push-button-pen-13201837.html', artwork: 'hcm-pen-prt',
  },
  {
    sku: 'HCM-JRNL', name: 'Studio Linen Journal', collection: 'Studio Collection', finish: 'Printed',
    description: 'A tactile journal for ideas, stories, sketches and workshop notes.', supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand', status: 'Testing', artwork: 'hcm-jrnl-prt',
  },
  {
    sku: 'HCM-TOTE-PRT', name: 'Heritage Canvas Tote', collection: 'Heritage Core', finish: 'Printed',
    description: 'A useful heavy canvas carry bag with the HCM identity built for everyday use.', supplier: 'Prodigi — initial fulfilment option',
    fulfilment: 'Print on demand', status: 'Testing', artwork: 'hcm-tote-prt',
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-olive/10 text-brand-olive text-sm font-bold mb-6"><Sparkles size={16} /> HCM Merchandise</div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-brand-ink tracking-tight">A small range. Properly chosen.</h1>
          <p className="mt-6 text-lg md:text-xl text-brand-ink/70 leading-relaxed">HCM owns the shop and the customer. Suppliers are simply fulfilment routes. We can buy from Fluid, Prodigi, Bordon, Alton printers or anyone else when the product and price make sense.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl border border-brand-olive/15 bg-white/80 p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex gap-4 items-start"><Database className="text-brand-olive mt-1" size={24} /><div><h2 className="font-serif text-2xl font-bold">Supplier catalogue import is now part of the architecture</h2><p className="mt-1 text-sm text-brand-ink/60">A product can carry its supplier reference, URL, description, price guide, MOQ and multiple product images — not just a reference number.</p></div></div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-olive/10 px-4 py-2 text-sm font-bold text-brand-olive"><Download size={15} /> Import-ready</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const StatusIcon = statusStyles[product.status].icon;
            return (
              <article key={product.sku} className={`group rounded-3xl border border-brand-olive/15 bg-white/80 p-6 shadow-sm hover:shadow-lg transition-all ${product.featured ? 'lg:col-span-2' : ''}`}>
                <div className="aspect-[4/3] rounded-2xl bg-brand-ink/5 flex items-center justify-center overflow-hidden border border-brand-ink/5">
                  {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-contain" loading="lazy" /> : <div className="text-center px-6"><Package className="mx-auto text-brand-olive/50 mb-3" size={42} /><p className="text-sm font-bold text-brand-ink/40">PRODUCT IMAGE</p></div>}
                </div>
                <div className="pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><span className="text-xs font-bold uppercase tracking-widest text-brand-olive">{product.collection}</span><span className="text-xs font-semibold text-brand-ink/50">{product.finish}</span></div>
                  <h2 className="font-serif text-2xl font-bold text-brand-ink">{product.name}</h2>
                  <p className="mt-3 text-brand-ink/65 leading-relaxed">{product.description}</p>
                  {product.price && <p className="mt-4 text-lg font-bold text-brand-ink">{product.price}</p>}
                  <div className="mt-5 rounded-2xl bg-brand-cream/70 p-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2"><Truck size={16} className="mt-0.5 text-brand-olive shrink-0" /><span><strong>Supplier:</strong> {product.supplier}</span></div>
                    <div className="text-brand-ink/60"><strong>Fulfilment:</strong> {product.fulfilment}</div>
                    <div className="text-brand-ink/60"><strong>HCM SKU:</strong> {product.sku}</div>
                    {product.supplierRef && <div className="text-brand-ink/60"><strong>Supplier ref:</strong> {product.supplierRef}</div>}
                  </div>
                  {product.costNote && <p className="mt-4 text-xs text-brand-ink/55 leading-relaxed">{product.costNote}</p>}
                  <div className="mt-5 flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink/60"><StatusIcon size={15} /> {statusStyles[product.status].label}</span>{product.supplierUrl && <a href={product.supplierUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-brand-olive hover:underline">Supplier page <ExternalLink size={13} /></a>}</div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-brand-olive/15 bg-brand-olive/5"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="grid md:grid-cols-3 gap-8"><div><p className="font-bold text-brand-olive">1. Choose the product</p><p className="mt-2 text-sm text-brand-ink/65">Record the exact product, supplier reference, images, material, colour, size and MOQ.</p></div><div><p className="font-bold text-brand-olive">2. Set the HCM price</p><p className="mt-2 text-sm text-brand-ink/65">Supplier cost stays private. HCM sets the customer price and margin separately.</p></div><div><p className="font-bold text-brand-olive">3. Choose fulfilment</p><p className="mt-2 text-sm text-brand-ink/65">The same HCM product can use Prodigi, Fluid, a local supplier or HCM-held stock without rebuilding the shop.</p></div></div></div></section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="rounded-3xl bg-brand-ink text-white p-8 md:p-10"><div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><div><h2 className="font-serif text-2xl md:text-3xl font-bold">Supplier-first, not supplier-locked.</h2><p className="mt-2 text-white/70 max-w-2xl">The shop database now has room for supplier URLs, references, images, guide pricing and MOQs. A supplier-import function is also deployed so we can automate the boring part rather than manually retyping every product.</p></div><div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 text-white font-bold text-sm shrink-0"><CheckCircle2 size={17} /> Catalogue built</div></div></div></section>
    </div>
  );
}
