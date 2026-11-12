// ————— daily deterministic pick: same painting for everyone, same day —————
function dayIndex(n) {
  // days since 1970-01-01 UTC
  const days = Math.floor(Date.now() / 86400000);
  return days % n;
}

// ————— Persian date via Intl —————
function faDate() {
  // Gregorian date, weekday first: «پنجشنبه، ۱۲ نوامبر ۲۰۲۶»
  try {
    const d = new Date();
    const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(d);
    const rest = new Intl.DateTimeFormat("fa-IR", {
      day: "numeric", month: "long", year: "numeric", calendar: "gregory"
    }).format(d);
    return weekday + "، " + rest;
  } catch (e) {
    return "";
  }
}

// ————— load data —————
fetch("data.json")
  .then(r => r.json())
  .then(artworks => {
    const art = artworks[dayIndex(artworks.length)];

    document.title = art.title + " — Painting Whisper";
    document.getElementById("title").textContent = art.title;
    document.getElementById("artist").textContent = art.artist === "Unknown" ? "هنرمند ناشناس" : art.artist;
    document.getElementById("year").textContent = art.year || "—";
    document.getElementById("medium").textContent = art.medium || "";
    document.getElementById("dateLabel").textContent = faDate();
    document.getElementById("btnInfo").onclick = () => window.open(art.metUrl, "_blank");

    const img = document.getElementById("art");
    img.alt = art.title + " — " + art.artist;
    img.onload = () => {
      img.classList.add("loaded");
      document.getElementById("skeleton").classList.add("gone");
    };
    // local image first; fall back to the Met server if missing
      img.src = art.local;
      img.onerror = () => {
        img.onerror = null;
        img.src = (art.imgSmall || art.img || "").replace("http://", "https://");
      };

    // share button
    document.getElementById("btnShare").onclick = async () => {
      const url = location.href;
      if (navigator.share) {
        try { await navigator.share({ title: "Painting Whisper", text: art.title + " — " + art.artist, url }); return; } catch (e) {}
      }
      try {
        await navigator.clipboard.writeText(url);
        toast("لینک امروز کپی شد ✓");
      } catch (e) {
        toast("کپی نشد — لینک: " + url);
      }
    };
  })
  .catch(() => {
    document.getElementById("title").textContent = "خطا در بارگذاری داده";
    document.getElementById("skeleton").classList.add("gone");
  });

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2500);
}
