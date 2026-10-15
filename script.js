document.querySelectorAll(".nav-toggle").forEach(function(toggle) {
	const navbar = toggle.closest(".navbar");
	const navLinks = document.getElementById(toggle.getAttribute("aria-controls"));

	if (!navbar || !navLinks) {
		return;
	}

	function closeNavigation() {
		navbar.classList.remove("menu-open");
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open navigation menu");
		toggle.title = "Open menu";
	}

	toggle.addEventListener("click", function() {
		const isOpen = toggle.getAttribute("aria-expanded") === "true";

		if (isOpen) {
			closeNavigation();
			return;
		}

		navbar.classList.add("menu-open");
		toggle.setAttribute("aria-expanded", "true");
		toggle.setAttribute("aria-label", "Close navigation menu");
		toggle.title = "Close menu";
	});

	navLinks.addEventListener("click", function(event) {
		if (event.target.closest("a")) {
			closeNavigation();
		}
	});

	document.addEventListener("click", function(event) {
		if (!navbar.contains(event.target)) {
			closeNavigation();
		}
	});

	document.addEventListener("keydown", function(event) {
		if (event.key === "Escape") {
			closeNavigation();
		}
	});

	window.addEventListener("resize", function() {
		if (window.innerWidth > 800) {
			closeNavigation();
		}
	});
});

document.querySelectorAll(".dashboard-menu-toggle").forEach(function(toggle) {
	const dashboard = document.querySelector(".dashboard");
	const sidebar = document.getElementById(toggle.getAttribute("aria-controls"));

	if (!dashboard || !sidebar) {
		return;
	}

	function closeDashboardNavigation() {
		dashboard.classList.remove("navigation-open");
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open dashboard navigation");
	}

	toggle.addEventListener("click", function() {
		const isOpen = toggle.getAttribute("aria-expanded") === "true";
		dashboard.classList.toggle("navigation-open", !isOpen);
		toggle.setAttribute("aria-expanded", String(!isOpen));
		toggle.setAttribute("aria-label", isOpen ? "Open dashboard navigation" : "Close dashboard navigation");
	});

	sidebar.addEventListener("click", function(event) {
		if (event.target.closest("a")) {
			closeDashboardNavigation();
		}
	});

	document.addEventListener("click", function(event) {
		if (!dashboard.contains(event.target) && !toggle.contains(event.target)) {
			closeDashboardNavigation();
		}
	});

	document.addEventListener("keydown", function(event) {
		if (event.key === "Escape") {
			closeDashboardNavigation();
		}
	});

	window.addEventListener("resize", function() {
		if (window.innerWidth > 650) {
			closeDashboardNavigation();
		}
	});
});
