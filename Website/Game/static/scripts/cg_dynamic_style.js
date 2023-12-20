document.addEventListener("DOMContentLoaded", function() {
  const body = document.body;
  const startColor = [160, 107, 246]; // cornflowerblue
  const endColor = [109, 39, 221]; // royalblue
  const maxScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const games = document.querySelectorAll('.game');
  const maxScale = 1.03;
  const distanceThreshold = 400;

  function updateBackground() {
    const scrollProgress = window.scrollY / maxScrollHeight;
    const currentColor = startColor.map((color, index) => {
      return Math.round(color + (endColor[index] - color) * scrollProgress);
    });
    body.style.backgroundColor = `rgb(${currentColor.join(',')})`;

    const centerY = window.innerHeight / 2 + window.scrollY;
    games.forEach(game => {
      const gameRect = game.getBoundingClientRect();
      const gameY = gameRect.y + gameRect.height / 2 + window.scrollY;
      const distance = Math.abs(centerY - gameY);
      const scale = 1 + (maxScale - 1) * (1 - Math.min(distance / distanceThreshold, 1));
      game.style.transform = `translateY(-${window.scrollY * 10 * game.getAttribute('data-depth')}px) scale(${scale})`;
    });
  }

  window.addEventListener('scroll', updateBackground);
});