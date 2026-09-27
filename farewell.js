(() => {
  'use strict';
  const names = [
  "Alisa R",
  "Jason W",
  "Alyssa P",
  "Eric",
  "Cynthia",
  "Sarah",
  "Jake",
  "Autumndaun",
  "Elena",
  "Emma",
  "Nubez",
  "Kayleigh",
  "Aubrey",
  "Meadow",
  "Cailin",
  "Colton",
  "Mindy",
  "Grace",
  "Kristin",
  "Bobby",
  "Madelynne",
  "Alexis K",
  "Alexis H",
  "Jackie",
  "Gabi",
  "Jenny",
  "Case",
  "Aleta",
  "Hannah",
  "Nelson",
  "Audrey",
  "Chloe"
];
  const messages = [
  "A kind welcome can stay with someone long after their visit. Thank you for offering yours.",
  "Even on the busiest days, your patience makes a difference.",
  "For six months, I got to be part of this team. Thank you for sharing this place with me.",
  "You help people find their way, feel at ease, and notice something beautiful. That matters.",
  "I hope you get a quiet moment to enjoy the Garden today, too.",
  "Keep looking after one another. You deserve the same kindness you offer our visitors.",
  "I’m leaving with a lot of appreciation for the people who make this place feel welcoming.",
  "There’s always something new to notice here. Keep that curiosity with you.",
  "Thank you for the time we’ve shared. I’ll miss being part of this team.",
  "The next visitor may be seeing the Garden for the very first time. What a lovely thing to help them discover."
];
  window.GardenFarewell = {messageForRound: round => messages[round % messages.length]};
  const list = document.getElementById('gardenNames');
  for (const name of names) {
    const item = document.createElement('li');
    item.textContent = name;
    list.append(item);
  }
  for (const [openId, dialogId, closeId] of [
    ['openFarewell', 'farewellDialog', 'closeFarewell'],
    ['openSecretGarden', 'secretGardenDialog', 'closeSecretGarden']
  ]) {
    const opener = document.getElementById(openId);
    const dialog = document.getElementById(dialogId);
    opener.addEventListener('click', () => {dialog.showModal(); dialog.scrollTop = 0;});
    document.getElementById(closeId).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => opener.focus({preventScroll: true}));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  }
})();
