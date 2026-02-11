import FadeIn from "./FadeIn";

const frictionPoints = [
  "Texts and phone calls for orders",
  "Notes written down and re-entered later",
  "Drivers calling in updates",
  "Invoices done separately from delivery records",
  "Admin stitching everything together at the end of the week",
];

const RealitySection = () => {
  return (
    <section id="reality" className="py-32 md:py-40 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-sans text-sm tracking-[0.25em] uppercase text-accent mb-6">
            The reality
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground leading-[1.15] mb-6 max-w-2xl">
            Right now, most growing businesses run on a mix of&hellip;
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="bronze-line w-full my-12" />
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {frictionPoints.map((point, i) => (
            <FadeIn key={i} delay={0.15 * i}>
              <div className="bg-card p-8 border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-500">
                <span className="font-sans text-xs tracking-[0.2em] uppercase text-accent/60 mb-3 block">
                  0{i + 1}
                </span>
                <p className="font-sans text-base text-foreground/80 leading-relaxed">
                  {point}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="font-serif text-xl md:text-2xl italic text-muted-foreground mt-16 text-center">
            It works — until it doesn't.
          </p>
        </FadeIn>
      </div>
    </section>
  );
};

export default RealitySection;
