function startIntroduction(motion) {
  const scenes = [...motion.querySelectorAll(".motion-scene")];
  const chapters = [...motion.querySelectorAll("[data-chapter]")];
  const toggle = motion.querySelector(".motion-toggle");
  const caption = motion.querySelector(".motion-caption");
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const chapterDuration = 7000;
  let current = 0;
  let paused = false;
  let inView = true;
  let timer;
  let startedAt;
  let remaining = chapterDuration;

  function updatePlayback() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    }

    const playing = !paused && !preference.matches && inView && !document.hidden;
    motion.toggleAttribute("data-running", playing);
    motion.toggleAttribute("data-paused", paused);
    toggle.hidden = preference.matches;
    toggle.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");

    if (playing) {
      startedAt = performance.now();
      timer = setTimeout(() => {
        timer = undefined;
        showChapter((current + 1) % scenes.length);
      }, remaining);
    }
  }

  function showChapter(index, manual = false) {
    clearTimeout(timer);
    timer = undefined;
    remaining = chapterDuration;
    current = index;
    scenes.forEach((scene, i) => { scene.hidden = i !== index; });
    chapters.forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    caption.textContent = chapters[index].getAttribute("aria-label");
    motion.toggleAttribute("data-still", manual);
    if (manual) paused = true;
    updatePlayback();
  }

  chapters.forEach((button, index) => {
    button.addEventListener("click", () => showChapter(index, true));
  });
  toggle.addEventListener("click", () => {
    paused = !paused;
    if (!paused) motion.removeAttribute("data-still");
    updatePlayback();
  });
  preference.addEventListener("change", updatePlayback);
  document.addEventListener("visibilitychange", updatePlayback);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    }).observe(motion);
  }

  motion.querySelector(".motion-controls").hidden = false;
  motion.setAttribute("data-enhanced", "");
  updatePlayback();
}

document.querySelectorAll("[data-motion]").forEach(startIntroduction);
