// Tiny event bus coordinating the preloader / page transitions with
// per-page entrance animations. "cover" fires when a transition curtain
// starts covering the screen, "reveal" when the new page is being revealed.

type Cb = () => void;

const revealCbs = new Set<Cb>();
const coverCbs = new Set<Cb>();
let revealed = false;

export const bus = {
  get revealed() {
    return revealed;
  },
  onReveal(cb: Cb): () => void {
    revealCbs.add(cb);
    if (revealed) cb();
    return () => {
      revealCbs.delete(cb);
    };
  },
  onCover(cb: Cb): () => void {
    coverCbs.add(cb);
    return () => {
      coverCbs.delete(cb);
    };
  },
  reveal() {
    if (revealed) return;
    revealed = true;
    revealCbs.forEach((cb) => cb());
  },
  cover() {
    revealed = false;
    coverCbs.forEach((cb) => cb());
  },
};
