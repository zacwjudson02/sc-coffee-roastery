/**
 * ProposalGuide.ts
 * 
 * Implements a "guided reading" micro-animation system.
 * - Highlights text based on estimated reading speed.
 * - Guides the user through sections.
 * - Bounces an arrow when reading is done or idle.
 */

interface Config {
  wpm: number;
  highlightDurationMin: number;
  highlightDurationMax: number;
  shimmerDrift: number;
  idleBounceIntervalMin: number;
  idleBounceIntervalMax: number;
  bounceStrength: number;
  scrollDebounce: number;
}

const CONFIG: Config = {
  wpm: 180,
  highlightDurationMin: 10000,
  highlightDurationMax: 15000,
  shimmerDrift: 4, // px
  idleBounceIntervalMin: 10000,
  idleBounceIntervalMax: 15000,
  bounceStrength: 8, // px
  scrollDebounce: 250,
};

declare global {
  interface Window {
    ProposalGuide: {
      start: () => void;
      stop: () => void;
      setWpm: (n: number) => void;
    };
  }
}

class ProposalGuideSystem {
  private isActive: boolean = false;
  private currentSection: HTMLElement | null = null;
  private highlightEl: HTMLElement | null = null;
  private arrowEl: HTMLButtonElement | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private scrollTimer: NodeJS.Timeout | null = null;
  private guidanceTimer: NodeJS.Timeout | null = null;
  private observer: IntersectionObserver | null = null;
  private isManualScrolling: boolean = false;
  private hasInteracted: boolean = false;
  private arrowAllowed: boolean = false;
  private overlayCheckInterval: NodeJS.Timeout | null = null;

  init() {
    if (this.isActive) return;
    this.isActive = true;

    // Create UI elements
    this.createHighlight();
    this.createArrow();

    // Setup IntersectionObserver
    this.setupObserver();

    // Setup Event Listeners
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // User interaction listeners to stop idle bounces
    ['mousedown', 'touchstart', 'keydown'].forEach(evt => 
      window.addEventListener(evt, () => this.stopIdle(), { once: true })
    );

    // Initial check
    this.checkVisibleSection();
    
    // Expose API
    window.ProposalGuide = {
      start: () => this.start(),
      stop: () => this.stop(),
      setWpm: (n: number) => { CONFIG.wpm = n; }
    };

    console.log('ProposalGuide initialized');
  }

  createHighlight() {
    if (document.getElementById('pg-highlight')) return;
    
    const el = document.createElement('div');
    el.id = 'pg-highlight';
    el.className = 'pg-highlight';
    document.body.appendChild(el);
    this.highlightEl = el;
  }

  createArrow() {
    if (document.getElementById('pg-arrow')) return;

    const btn = document.createElement('button');
    btn.id = 'pg-arrow';
    btn.className = 'pg-arrow hidden';
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
      </svg>
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.goToNextSection();
    });
    document.body.appendChild(btn);
    this.arrowEl = btn;

    // Keep arrow hidden for 8.5 seconds (duration of welcome overlay)
    setTimeout(() => {
      this.arrowAllowed = true;
      if (this.arrowEl && this.isActive) {
        // Arrow can now be shown when needed
        this.checkVisibleSection();
      }
    }, 8500);

    // Poll for overlay visibility - check every 500ms if overlay has disappeared
    this.overlayCheckInterval = setInterval(() => {
      const welcomeOverlay = document.querySelector('.fixed.inset-0.z-50.bg-black');
      if (!welcomeOverlay && this.arrowEl && this.isActive) {
        // Overlay is gone, update arrow state
        this.arrowAllowed = true;
        this.checkVisibleSection();
      }
    }, 500);
  }

  setupObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.4 // Only run when 40% visible
    };

    this.observer = new IntersectionObserver((entries) => {
      // Find the most visible section
      // We process all entries, but usually we care about the one that is intersecting
      // For simplicity, handleScroll logic often does a better job at "most visible" 
      // but observer is good for entering/leaving.
      
      // Actually, relying purely on intersection observer for "current" can be tricky with multiple sections visible.
      // Let's use it to pause/resume if the CURRENT section goes out of view.
      
      entries.forEach(entry => {
        if (entry.target === this.currentSection && !entry.isIntersecting) {
          this.stopGuidance();
        }
      });
    }, options);

    // Observe all sections
    document.querySelectorAll('[data-section]').forEach(sec => {
      this.observer?.observe(sec);
    });
  }

  handleScroll() {
    if (!this.isActive) return;

    this.isManualScrolling = true;
    this.stopGuidance();
    
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      this.isManualScrolling = false;
      this.checkVisibleSection();
    }, CONFIG.scrollDebounce);
  }

  checkVisibleSection() {
    if (this.isManualScrolling) return;

    // Find section taking up most screen space
    const sections = Array.from(document.querySelectorAll('[data-section]')) as HTMLElement[];
    let maxVisibleHeight = 0;
    let bestSection: HTMLElement | null = null;

    const vH = window.innerHeight;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      
      // Calculate visible height of section
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(vH, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        bestSection = sec;
      }
    });

    // Only switch if significant visibility and different section
    if (bestSection && maxVisibleHeight > vH * 0.3) {
      if (bestSection !== this.currentSection) {
        this.startGuidance(bestSection);
      } else if (bestSection.id === 'future-state' || bestSection.id === 'system-overview') {
        // Special handling for future-state AND system-overview infographic visibility
        // Ensure arrow is fully visible when infographic is in view
        const img = bestSection.querySelector('img');
        if (img) {
          const rect = img.getBoundingClientRect();
          // If image is substantially visible
          if (rect.top < vH * 0.8 && rect.bottom > vH * 0.1) {
            this.setArrowState('visible');
          }
        }
      }
    }
  }

  startGuidance(section: HTMLElement) {
    if (!section) return;
    this.stopGuidance(); // Stop any existing

    this.currentSection = section;
    const readBlock = section.querySelector('[data-read]') as HTMLElement;
    
    if (!readBlock) {
      // No reading block, maybe just show arrow if suitable or wait
      this.setArrowState('visible');
      return;
    }

    if (!this.highlightEl) return;

    // Check reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Calculate duration
    const text = readBlock.innerText || "";
    const words = text.split(/\s+/).length;
    let duration = (words / CONFIG.wpm) * 60 * 1000;
    duration = Math.max(CONFIG.highlightDurationMin, Math.min(duration, CONFIG.highlightDurationMax));

    // Position highlight
    const rect = readBlock.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    this.highlightEl.style.width = `${rect.width + 20}px`; // padding
    this.highlightEl.style.height = `${rect.height + 20}px`;
    this.highlightEl.style.top = `${rect.top + scrollTop - 10}px`;
    this.highlightEl.style.left = `${rect.left + scrollLeft - 10}px`;
    this.highlightEl.style.display = 'block';
    
    // Force reflow
    void this.highlightEl.offsetWidth;

    // Start animation
    this.highlightEl.classList.add('active');
    
    if (!reducedMotion) {
      this.highlightEl.style.animation = `pg-shimmer ${duration}ms linear forwards`;
    } else {
       this.highlightEl.style.animation = 'none'; // Static
       // Still wait for duration to show arrow? 
       // Requirement: "replace with static highlight + no bounce"
    }

    // Hide arrow during reading (or rather, set to faded)
    this.setArrowState('faded');

    // Schedule completion
    this.guidanceTimer = setTimeout(() => {
      this.endGuidance();
    }, duration);
  }

  stopGuidance() {
    if (this.highlightEl) {
      this.highlightEl.classList.remove('active');
      this.highlightEl.style.animation = 'none';
      this.highlightEl.style.display = 'none';
    }
    if (this.guidanceTimer) clearTimeout(this.guidanceTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  endGuidance() {
    this.stopGuidance();
    
    // Trigger arrow bounce
    this.setArrowState('visible');
    this.bounceArrow(2); // 2 bounces initially
    
    // Start idle loop
    this.startIdleLoop();
  }

  setArrowState(state: 'hidden' | 'faded' | 'visible') {
    if (!this.arrowEl) return;
    
    this.arrowEl.classList.remove('hidden', 'faded', 'visible');

    // Check if WelcomeOverlay is currently visible - if so, hide arrow
    const welcomeOverlay = document.querySelector('.fixed.inset-0.z-50.bg-black');
    if (welcomeOverlay) {
      this.arrowEl.classList.add('hidden');
      return;
    }

    // Don't show arrow until welcome overlay is done
    if (!this.arrowAllowed) {
      this.arrowEl.classList.add('hidden');
      return;
    }

    // Check if next section exists before showing anything
    let hasNext = false;
    if (this.currentSection) {
      const sections = Array.from(document.querySelectorAll('[data-section]'));
      const idx = sections.indexOf(this.currentSection);
      if (idx >= 0 && idx < sections.length - 1) {
        hasNext = true;
      }
    }

    if (!hasNext) {
      this.arrowEl.classList.add('hidden');
      return;
    }

    this.arrowEl.classList.add(state);
  }

  startIdleLoop() {
    const delay = Math.random() * (CONFIG.idleBounceIntervalMax - CONFIG.idleBounceIntervalMin) + CONFIG.idleBounceIntervalMin;
    
    this.idleTimer = setTimeout(() => {
        if (!this.hasInteracted) {
             this.bounceArrow(1);
             this.startIdleLoop();
        }
    }, delay);
  }

  bounceArrow(count: number) {
    if (!this.arrowEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    // Remove class to reset
    this.arrowEl.classList.remove('bounce');
    void this.arrowEl.offsetWidth; // Reflow
    
    // We can use CSS animation for bounce
    // But since we want variable count, maybe just add class that runs once
    // Let's use a class that iterates 'count' times? Or just infinite and remove it.
    // Simpler: CSS keyframes for 1 bounce, set animation-iteration-count via style
    this.arrowEl.style.animationIterationCount = count.toString();
    this.arrowEl.classList.add('bounce');
    
    // Clean up class after animation
    setTimeout(() => {
        if (this.arrowEl) this.arrowEl.classList.remove('bounce');
    }, 1000 * count); // Assuming 1s bounce
  }

  stopIdle() {
    this.hasInteracted = true;
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  goToNextSection() {
    this.stopIdle();
    
    if (!this.currentSection) {
        // Fallback: find first visible
        this.checkVisibleSection();
        if (!this.currentSection) return;
    }

    // Special handling for Future State Vision AND System Overview (split scroll)
    // Scroll to infographic first, then to next section
    if (this.currentSection.id === 'future-state' || this.currentSection.id === 'system-overview') {
        const imageContainer = this.currentSection.querySelector('img')?.closest('div');
        if (imageContainer) {
            const rect = imageContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If image is effectively below the main viewing area (e.g. top is below 30% of viewport)
            // We consider it "not yet visited" via the button
            if (rect.top > viewportHeight * 0.3) {
                // Scroll to image with some offset
                const offset = 100; 
                const targetY = rect.top + window.pageYOffset - offset;
                
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                
                // Restart idle behavior after scroll so the arrow feels alive
                setTimeout(() => {
                    this.setArrowState('visible');
                    this.bounceArrow(1);
                    this.startIdleLoop();
                }, 800);
                
                return;
            }
        }
    }

    const sections = Array.from(document.querySelectorAll('[data-section]'));
    const idx = sections.indexOf(this.currentSection);
    
    if (idx >= 0 && idx < sections.length - 1) {
        const next = sections[idx + 1] as HTMLElement;
        
        // Try to scroll to content to skip section padding (bring heading to top)
        const content = (next.querySelector('[data-read]') || next.querySelector('h1, h2, h3') || next) as HTMLElement;
        
        // Calculate position with offset for header + extra breathing room
        // Header is approx 100px, adding extra to ensure subtitle is clearly visible
        let headerOffset = 130; 
        
        // Special case for pain points section to reveal more bottom text
        if (next.id === 'pain-points') {
            headerOffset = 110;
        } else if (next.id === 'system-overview') {
            // Push text down to middle of page so infographic is less visible initially
            headerOffset = window.innerHeight * 0.25;
        }

        const elementPosition = content.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
        
        // Guidance will restart automatically via scroll observer/debounce
    }
  }

  stop() {
    this.isActive = false;
    this.stopGuidance();
    window.removeEventListener('scroll', this.handleScroll);
    if (this.highlightEl) this.highlightEl.remove();
    if (this.arrowEl) this.arrowEl.remove();
    if (this.overlayCheckInterval) clearInterval(this.overlayCheckInterval);
    this.highlightEl = null;
    this.arrowEl = null;
    if (this.observer) this.observer.disconnect();
  }

  start() {
      if (!this.isActive) this.init();
  }
}

export default new ProposalGuideSystem();
