import FadeIn from "./FadeIn";

const flowSteps = ["Booking", "Driver App", "Proof of Delivery", "Invoice"];

const results = [
  "Fewer calls",
  "Cleaner data",
  "Faster invoicing",
  "Less friction day to day",
];

const TransportStory = () => {
  return (
    <section className="py-32 md:py-40 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p className="font-sans text-sm tracking-[0.25em] uppercase text-bronze-light mb-6">
            The transport proof story
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="font-serif text-3xl md:text-5xl font-medium leading-[1.15] mb-6 max-w-3xl">
            What we built in transport
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="h-px w-full bg-primary-foreground/10 my-12" />
        </FadeIn>

        <div className="max-w-3xl mx-auto">
          {/* Narrative */}
          <FadeIn delay={0.2}>
            <p className="font-sans text-lg text-primary-foreground/70 leading-relaxed mb-8">
              We implemented this platform inside a refrigerated freight company
              where the admin desk was chaos.
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="space-y-2 mb-10 font-sans text-primary-foreground/50">
              <p>Hundreds of bookings.</p>
              <p>PODs everywhere.</p>
              <p>Invoices delayed.</p>
              <p>Drivers constantly calling in.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="font-serif text-xl italic text-bronze-light mb-10">
              We rebuilt the workflow from the ground up.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="space-y-0 my-16">
              {flowSteps.map((step, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4 py-5">
                    <span className="font-sans text-xs tracking-[0.2em] text-bronze-light/60">
                      0{i + 1}
                    </span>
                    <span className="font-serif text-xl text-primary-foreground/80">
                      {step}
                    </span>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <div className="ml-4 h-6 border-l border-bronze/30" />
                  )}
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="space-y-3 mb-10">
              <p className="font-sans text-sm tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">
                The result was simple
              </p>
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-bronze" />
                  <span className="font-sans text-primary-foreground/70">{r}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="font-serif text-lg italic text-primary-foreground/60">
              It didn't add complexity.
              <br />
              It removed it.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default TransportStory;
