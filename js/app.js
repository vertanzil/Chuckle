(function () {
  async function fetchJoke() {
    try {
      const response = await fetch("https://api.chucknorris.io/jokes/random");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const { icon_url, id, value } = data;
      return { icon_url, id, value };
    } catch (error) {
      // Propagate error to caller
      throw error;
    }
  }

  // Expose for tests
  window.fetchJoke = fetchJoke;

  document.addEventListener("DOMContentLoaded", () => {
    const speechBubble = document.querySelector(".speech-bubble");
    const refreshBtn = document.getElementById("refresh-btn");
    const autoCb = document.getElementById("auto-refresh-checkbox");

    let autoTimer = null;
    let inFlight = false;

    function clearAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
      if (autoCb) autoCb.checked = false;
    }

    async function refreshJoke() {
      if (!speechBubble || inFlight) return;
      inFlight = true;

      const originalBtnText = refreshBtn ? refreshBtn.textContent : "";
      if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = "Refreshing...";
      }

      speechBubble.textContent = "Loading joke...";

      try {
        const joke = await fetchJoke();
        speechBubble.textContent = joke.value;
      } catch (_) {
        speechBubble.textContent = "Failed to fetch a new joke. Try again.";
      } finally {
        inFlight = false;
        if (refreshBtn) {
          refreshBtn.disabled = false;
          refreshBtn.textContent = originalBtnText;
        }
      }
    }

    // Initial fetch
    refreshJoke();

    // Manual refresh
    if (refreshBtn) {
      refreshBtn.addEventListener("click", refreshJoke);
    }

    // Auto refresh toggle
    if (autoCb) {
      autoCb.addEventListener("change", () => {
        if (autoCb.checked) {
          // Immediately refresh, then every 5 seconds
          refreshJoke();
          autoTimer = setInterval(refreshJoke, 5000);
        } else {
          clearAuto();
        }
      });
    }

    // Clean up timer if the page is hidden/unloaded
    window.addEventListener("beforeunload", clearAuto);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearAuto();
      }
    });
  });
})();
