(() => {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute(
        'aria-label',
        isOpen ? 'メニューを閉じる' : 'メニューを開く'
      );
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        // Our Services hanya membuka submenu.
        // Jangan tutup seluruh menu ketika tombol ini diklik.
        if (link.classList.contains('mobile-service-toggle')) return;

        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // NEWS FILTER
  const filterButtons = document.querySelectorAll('.news-tabs button');
  const newsItems = document.querySelectorAll('.news-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(item => {
        item.classList.toggle('active', item === button);
      });

      newsItems.forEach(item => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });
    });
  });

  // REVEAL SECTIONS
  const revealTargets = document.querySelectorAll(
    '.work-card, .voice-card, .menu-card, .reason-row, .blog-card'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(target => {
      target.classList.add('will-reveal');
      observer.observe(target);
    });
  }
})();

/* =====================================================
   RE:INK HERO IMAGE SLIDER
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  const prevButton = document.querySelector(".hero-prev");
  const nextButton = document.querySelector(".hero-next");

  const hero = document.querySelector(".hero");

  if (!slides.length) return;

  let currentSlide = 0;
  let autoSlide;

  function showSlide(index) {
    slides.forEach(slide => {
      slide.classList.remove("active");
    });

    dots.forEach(dot => {
      dot.classList.remove("active");
    });

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");

    if (dots[currentSlide]) {
      dots[currentSlide].classList.add("active");
    }
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      nextSlide();
      resetAutoSlide();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      prevSlide();
      resetAutoSlide();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      showSlide(index);
      resetAutoSlide();
    });
  });

  function startAutoSlide() {
    autoSlide = setInterval(nextSlide, 5000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlide);
    startAutoSlide();
  }

  let touchStartX = 0;
  let touchEndX = 0;

  if (hero) {
    hero.addEventListener("touchstart", function (event) {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    hero.addEventListener("touchend", function (event) {
      touchEndX = event.changedTouches[0].screenX;

      const difference = touchStartX - touchEndX;

      if (Math.abs(difference) > 50) {
        if (difference > 0) {
          nextSlide();
        } else {
          prevSlide();
        }

        resetAutoSlide();
      }
    }, { passive: true });
  }

  startAutoSlide();
});

/* =========================================
   CUSTOMER VOICE - REVIEW SYSTEM
========================================= */

const reviewForm = document.getElementById("customerReviewForm");
const reviewList = document.getElementById("customerReviewList");
const reviewCount = document.getElementById("reviewCount");

let customerReviews = JSON.parse(
  localStorage.getItem("reinkCustomerReviews") || "[]"
);

function displayCustomerReviews() {
  if (!reviewList || !reviewCount) return;

  reviewList.innerHTML = "";

  reviewCount.textContent = customerReviews.length + " Reviews";

  if (customerReviews.length === 0) {
    reviewList.innerHTML = `
      <div class="review-empty">
        <p>No customer reviews yet.</p>
        <small>
          Be the first to share your experience with RE:INK!
        </small>
      </div>
    `;

    return;
  }

  customerReviews.forEach(review => {
    const card = document.createElement("article");
    card.className = "voice-card";

    const stars = document.createElement("div");
    stars.className = "stars";
    stars.textContent =
      "★".repeat(review.rating) +
      "☆".repeat(5 - review.rating);

    const message = document.createElement("p");
    message.textContent = review.message;

    const name = document.createElement("b");
    name.textContent = review.name;

    const date = document.createElement("small");
    date.className = "review-date";
    date.textContent = review.date;

    card.append(stars, message, name, date);
    reviewList.appendChild(card);
  });
}

if (reviewForm) {
  reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document
      .getElementById("customerName")
      .value.trim();

    const rating = Number(
      document.getElementById("customerRating").value
    );

    const message = document
      .getElementById("customerMessage")
      .value.trim();

    if (!name || !rating || !message) {
      alert("Please complete all review fields.");
      return;
    }

    const newReview = {
      name: name,
      rating: rating,
      message: message,
      date: new Date().toLocaleDateString("en-GB")
    };

    customerReviews.unshift(newReview);

    localStorage.setItem(
      "reinkCustomerReviews",
      JSON.stringify(customerReviews)
    );

    displayCustomerReviews();
    reviewForm.reset();

    alert("Thank you! Your review has been submitted.");
  });
}

displayCustomerReviews();

/* =========================================
   OUR WORKS - CATALOG FILTER & SEARCH
========================================= */

document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".works-filter-btn");
  const projectCards = document.querySelectorAll(".works-catalog-card");
  const searchInput = document.getElementById("worksSearch");
  const emptyResult = document.getElementById("worksEmptyResult");

  let activeCategory = "all";

  function filterWorks() {
    const keyword = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";

    let visibleCount = 0;

    projectCards.forEach(function (card) {
      const category = card.dataset.category;
      const content = card.textContent.toLowerCase();

      const categoryMatch =
        activeCategory === "all" ||
        category === activeCategory;

      const searchMatch = content.includes(keyword);

      if (categoryMatch && searchMatch) {
        card.classList.remove("hide");
        visibleCount++;
      } else {
        card.classList.add("hide");
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle("show", visibleCount === 0);
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      this.classList.add("active");
      activeCategory = this.dataset.filter;

      filterWorks();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", filterWorks);
  }
});

// =====================================
// MOBILE OUR SERVICES DROPDOWN
// =====================================

document.addEventListener("DOMContentLoaded", function () {
  const serviceDropdown = document.querySelector(
    ".mobile-service-dropdown"
  );

  const serviceToggle = document.querySelector(
    ".mobile-service-toggle"
  );

  if (!serviceDropdown || !serviceToggle) return;

  // Klik Our Services untuk membuka/menutup submenu
  serviceToggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const isActive = serviceDropdown.classList.toggle("active");

    serviceToggle.setAttribute(
      "aria-expanded",
      String(isActive)
    );
  });

  // Klik salah satu submenu
  const submenuLinks = serviceDropdown.querySelectorAll(
    ".mobile-service-submenu a"
  );

  submenuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      serviceDropdown.classList.remove("active");

      serviceToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    });
  });
});