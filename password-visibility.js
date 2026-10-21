document.querySelectorAll('input[type="password"]').forEach(function(input, index) {
    const wrapper = document.createElement("div");
    wrapper.className = "password-input-wrapper";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    if (!input.id) {
        input.id = "password-input-" + (index + 1);
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "password-visibility-toggle";
    toggle.textContent = "Show";
    toggle.setAttribute("aria-label", "Show password");
    toggle.setAttribute("aria-controls", input.id);
    toggle.setAttribute("aria-pressed", "false");
    wrapper.appendChild(toggle);

    toggle.addEventListener("click", function() {
        const isVisible = input.type === "text";
        input.type = isVisible ? "password" : "text";
        toggle.textContent = isVisible ? "Show" : "Hide";
        toggle.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
        toggle.setAttribute("aria-pressed", String(!isVisible));
    });
});
