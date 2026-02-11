import FadeIn from "./FadeIn";

const pressurePoints = [
  "Wholesale orders coming in from multiple cafes",
  "Drivers running local drops",
  "Proof of delivery needing to be recorded",
  "Invoices tied to what was actually delivered",
  "Stock and repeat orders relying on accurate records",
];

const flowSteps = [
  { num: "01", title: "Orders entered once", desc: "No re-keying, no lost details." },
  { num: "02", title: "Drivers see their runs", desc: "A clean mobile app. Nothing more." },
  { num: "03", title: "Delivery confirmed on the spot", desc: "Proof captured in real time." },
  { num: "04", title: "Invoices generated from real delivery data", desc: "Accurate. Automatic." },
  { num: "05", title: "Management can see everything live", desc: "No chasing. No guessing." },
];

const CoffeeTranslation = () => {
  return (
    <section className="py-32 md:py-40 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="font-sans text-sm tracking-[0.25em] uppercase text-accent mb-6">
            The coffee translation
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground leading-[1.15] mb-6 max-w-3xl">
            How that applies to a coffee roastery
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
            Your world is different - but the pressure points are similar:
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 mb-16">
            {pressurePoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-2.5 shrink-0" />
                <span className="font-sans text-foreground/70">{point}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="bronze-line w-full my-16" />
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="font-serif text-xl md:text-2xl italic text-foreground/60 mb-16 max-w-2xl">
            Instead of stitching it together manually, the system handles the flow:
          </p>
        </FadeIn>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-0">
            {flowSteps.map((step, i) => (
              <FadeIn key={i} delay={0.1 * i}>
                <div className="border-b border-border/60 py-8">
                  <div className="flex items-baseline gap-6">
                    <span className="font-sans text-xs tracking-[0.2em] text-accent/50">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg md:text-xl text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="font-sans text-sm text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoffeeTranslation;
