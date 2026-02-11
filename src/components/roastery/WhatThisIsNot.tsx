import FadeIn from "./FadeIn";

const WhatThisIsNot = () => {
  return (
    <section className="py-32 md:py-40 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <FadeIn>
          <p className="font-sans text-sm tracking-[0.25em] uppercase text-bronze-light mb-10">
            What this is not
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="font-serif text-2xl md:text-4xl font-medium leading-[1.3] mb-10">
            It's not generic off-the-shelf software.
          </h2>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="font-serif text-xl md:text-2xl text-primary-foreground/60 leading-relaxed mb-10">
            It's not something you have to bend your business around.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="h-px w-24 bg-bronze/40 mx-auto my-12" />
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="font-sans text-lg text-primary-foreground/60 leading-relaxed mb-8 max-w-xl mx-auto">
            It's a tailored operations layer that quietly runs in the background
            and keeps things smooth.
          </p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="font-serif text-xl md:text-2xl italic text-bronze-light">
            The goal is simple:
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <p className="font-sans text-lg text-primary-foreground/70 mt-6 leading-relaxed">
            Let you focus on roasting and relationships.
            <br />
            Let the system handle the operational admin.
          </p>
        </FadeIn>
      </div>
    </section>
  );
};

export default WhatThisIsNot;
