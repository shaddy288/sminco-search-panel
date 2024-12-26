let currentOffset = 0;
const limit = 10;
let sort_by = { field: "FOLLOWER_COUNT", order: "DESCENDING" };
let platform = "insta";
let follower_count = { min: null, max: null };
let topic = "";

function openNav() {
  document.getElementById("sideNav").style.width = "100%";
}

function closeNav() {
  document.getElementById("sideNav").style.width = "0%";
}

async function fetchCreators(offset, limit, platform, sort_by, follower_count, topic) {
  const url = `http://5500/api/influencer/v1/fetch-creators`;
  const postData = {
    offset: offset,
    limit: limit,
    platform: platform,
    sort_by: sort_by,
    follower_count: follower_count,
    topic: topic,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }

    const data = await response.json();
    return data && Array.isArray(data) && data.length > 0 ? data : [];
  } catch (error) {
    console.error("Failed to fetch creators:", error);
    return [];
  }
}

function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
}

function populateTable(creators) {
  const tableBody = document.querySelector(".table tbody");
  if (currentOffset === 0) {
    tableBody.innerHTML = "";
  }
  creators.forEach((creator) => {
    const row = document.createElement("tr");
    const imageUrl = creator.image_url
      ? creator.image_url
      : "https://via.placeholder.com/150";
    const engagementRatePercentage =
      (creator.engagement_rate * 100).toFixed(2) + "%";
    const followerCountFormatted = formatNumber(creator.follower_count);
    const averageLikesFormatted = formatNumber(creator.average_likes);
    const subscriberFormatted = formatNumber(creator.subscriber_count);
    const followers = followerCountFormatted ? followerCountFormatted : subscriberFormatted;

    row.innerHTML = `
        <td><input type="checkbox"></td>
        <td>
            <img src="${imageUrl}" alt="Avatar" class="creator-avatar">
            <div class="creator-info">
                ${creator.full_name || "N/A"}<br>
                <span class="handle"><a href="${creator.url || '#'}">@${creator.platform_username || "N/A"}</a></span>
            </div>
        </td>
        <td>${followers}</td>
        <td>${averageLikesFormatted}</td>
        <td>${engagementRatePercentage}</td>
        <td>
            <button class="btn btn-light btn-sm">
                <i class="fa fa-check" aria-hidden="true"></i>
            </button>
        </td>
        <td>
            <button class="btn btn-light btn-sm">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(row);
  });

  if (creators.length === 0 && currentOffset === 0) {
    tableBody.innerHTML =
      "<tr><td colspan='7'>No creators found with the selected filters.</td></tr>";
  }
}

async function loadMoreCreators() {
  const button = document.getElementById("loadMoreButton");
  button.innerText = "Loading...";
  const creators = await fetchCreators(
    currentOffset,
    limit,
    platform,
    sort_by,
    follower_count,
    topic
  );
  if (creators.length > 0) {
    populateTable(creators);
    currentOffset += limit;
    button.innerText = "Load More";
    button.disabled = false;
  } else {
    button.innerText = "No More Data";
    button.disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const platformSelect = document.getElementById("platformSelect");
  const followersFrom = document.getElementById("followersFrom");
  const followersTo = document.getElementById("followersTo");
  const topic = document.getElementById("topic");
  const form = document.querySelector("form");
  const button = document.getElementById("loadMoreButton");

  if (topic) {
    this.topic = topic;
  }

  platformSelect.addEventListener("change", function () {
    platform = this.value;
    currentOffset = 0;
    button.disabled = false;
    button.innerText = "Load More";
    loadMoreCreators();
  });

  followersFrom.addEventListener("change", function () {
    follower_count.min = parseInt(this.value) || null;
    currentOffset = 0;
    button.disabled = false;
    button.innerText = "Load More";
    loadMoreCreators();
  });

  followersTo.addEventListener("change", function () {
    follower_count.max = parseInt(this.value) || null;
    currentOffset = 0;
    button.disabled = false;
    button.innerText = "Load More";
    loadMoreCreators();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    currentOffset = 0;
    button.disabled = false;
    button.innerText = "Load More";
    loadMoreCreators();
  });

  loadMoreCreators();
});


// Filter js

document.addEventListener("DOMContentLoaded", function () {
  const platformSelect = document.getElementById("platformSelect");
  const followersFrom = document.getElementById("followersFrom");
  const followersTo = document.getElementById("followersTo");
  const filterTags = document.getElementById("filterTags");
  const clearFilters = document.getElementById("clearFilters");

  let selectedFilters = {};

  function updateFiltersDisplay() {
    filterTags.innerHTML = "";
    Object.keys(selectedFilters).forEach((key) => {
      const value = selectedFilters[key];
      const filterTag = document.createElement("div");
      filterTag.className = "filter-tag";
      filterTag.innerHTML = `
              <span>${key}: ${value}</span>
              <span class="remove-filter" data-filter="${key}">&times;</span>
          `;
      filterTags.appendChild(filterTag);
    });
    clearFilters.style.display = Object.keys(selectedFilters).length > 0 ? "block" : "none";

    // Add event listeners for individual filter removal
    document.querySelectorAll(".remove-filter").forEach((removeIcon) => {
      removeIcon.addEventListener("click", function () {
        const filterKey = this.getAttribute("data-filter");
        delete selectedFilters[filterKey];
        updateFiltersDisplay();
      });
    });
  }

  platformSelect.addEventListener("change", function () {
    selectedFilters["Platform"] = platformSelect.options[platformSelect.selectedIndex].text;
    updateFiltersDisplay();
  });

  followersFrom.addEventListener("change", function () {
    const fromValue = followersFrom.options[followersFrom.selectedIndex].text;
    const toValue = followersTo.options[followersTo.selectedIndex]?.text || "Any";
    selectedFilters["Followers"] = `${fromValue} - ${toValue}`;
    updateFiltersDisplay();
  });

  followersTo.addEventListener("change", function () {
    const fromValue = followersFrom.options[followersFrom.selectedIndex]?.text || "Any";
    const toValue = followersTo.options[followersTo.selectedIndex].text;
    selectedFilters["Followers"] = `${fromValue} - ${toValue}`;
    updateFiltersDisplay();
  });

  clearFilters.addEventListener("click", function () {
    selectedFilters = {};
    platformSelect.value = "insta";
    followersFrom.value = "0";
    followersTo.value = "0";
    updateFiltersDisplay();
  });

  updateFiltersDisplay();
});
