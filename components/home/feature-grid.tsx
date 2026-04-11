const features = [
  {
    title: "No Persistence",
    description: "Data purged globally on expiry or closure.",
  },
  {
    title: "Multi-Sync",
    description: "Copy on laptop, paste on mobile via code.",
  },
  {
    title: "Privacy First",
    description: "No accounts, no tracking, just utility.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60">
      {features.map((feature) => (
        <div key={feature.title} className="flex flex-col gap-2">
          <h5 className="font-heading font-bold text-xs uppercase tracking-widest text-on-surface">
            {feature.title}
          </h5>
          <p className="text-on-surface-variant text-xs font-body leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </section>
  );
}
