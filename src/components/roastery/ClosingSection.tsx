import FadeIn from "./FadeIn";

interface ClosingSectionProps {
  onWalkThrough?: () => void;
}

const ClosingSection = ({ onWalkThrough }: ClosingSectionProps) => {
  return (
    <section className="py-32 md:py-40 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn delay={0.1}>
          <p className="font-sans text-sm tracking-[0.25em] uppercase text-accent mb-6">
            What's next
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed mb-8">
            If it worked inside a hectic freight operation, I'm interested to
            see what it can do in a more refined environment like yours.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="h-px w-16 bg-accent/30 my-8 mx-auto" />
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="font-sans text-muted-foreground leading-relaxed mb-3">
            Next chat, we can walk through:
          </p>
          <ul className="space-y-2 mb-10 inline-block text-left">
            {[
              "Your current workflow",
              "Where time leaks out",
              "What a tailored version would look like for you",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 font-sans text-foreground/70">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="font-serif text-lg italic text-muted-foreground mb-10">
            No rush. Just want to make sure it's a fit.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <button
            onClick={onWalkThrough}
            className="inline-block font-sans text-sm tracking-[0.15em] uppercase border border-accent/60 text-accent px-8 py-4 hover:bg-accent/5 transition-all duration-500 cursor-pointer"
          >
            Walk Through Your Workflow
          </button>
        </FadeIn>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-32">
        <div className="bronze-line w-full mb-8" />
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground/50 text-center">
          A tailored operations blueprint - presented with taste.
        </p>
      </div>
    </section>
  );
};

export default ClosingSection;
