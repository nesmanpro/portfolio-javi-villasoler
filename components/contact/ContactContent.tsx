"use client";

import MediaReveal from "@/components/MediaReveal";
import SplitReveal from "@/components/SplitReveal";
import LocalTime from "@/components/LocalTime";
import { useContactPageContent, useFooterContent } from "@/hooks/useContent";

export default function ContactContent() {
  const { data: contact } = useContactPageContent();
  const { data: footer } = useFooterContent();

  return (
    <>
      <section data-theme-section="dark" className="px-[4vw] pt-40 pb-[8vh]">
        <SplitReveal as="p" trigger="load" className="label-mono opacity-50">
          {contact.pageEyebrow}
        </SplitReveal>
        <SplitReveal
          as="h1"
          type="chars"
          trigger="load"
          delay={0.2}
          stagger={0.04}
          duration={1.3}
          className="display hero-title"
          key={contact.pageTitle}
        >
          {contact.pageTitle}
        </SplitReveal>
      </section>

      <section data-theme-section="dark" className="px-[4vw] pb-[16vh]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-6 flex flex-col gap-10">
            <SplitReveal
              as="p"
              type="lines"
              trigger="load"
              delay={0.45}
              className="editorial"
              style={{ fontSize: "clamp(1.6rem, 3vw, 3rem)" }}
              key={contact.introParagraph}
            >
              {contact.introParagraph}
            </SplitReveal>

            <div>
              <SplitReveal
                as="p"
                trigger="load"
                delay={0.6}
                className="label-mono opacity-40 mb-2"
              >
                {contact.newBusinessLabel}
              </SplitReveal>
              <a
                href={`mailto:${contact.contactEmail}`}
                className="link-underline display"
                style={{ fontSize: "clamp(1.6rem, 3.4vw, 3.4rem)" }}
              >
                {contact.contactEmail}
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <SplitReveal
                as="p"
                trigger="load"
                delay={0.7}
                className="label-mono opacity-40"
              >
                {contact.topicsQuestionLabel}
              </SplitReveal>
              <div className="flex flex-wrap gap-3 mt-2">
                {contact.projectTopics.map((topic) => (
                  <a
                    key={topic}
                    href={`mailto:${contact.contactEmail}?subject=${encodeURIComponent(
                      `New project — ${topic}`
                    )}`}
                    className="btn-pill"
                  >
                    {topic}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-3 mt-4">
              <LocalTime className="label-mono opacity-50" />
              {footer.socialLinks.map((social) => (
                <a
                  key={social.platformName}
                  href={social.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline label-mono"
                >
                  {social.platformName}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <MediaReveal trigger="load" delay={0.5} parallax className="aspect-[3/4]">
              <video
                src={contact.sideVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              />
            </MediaReveal>
          </div>
        </div>
      </section>
    </>
  );
}
