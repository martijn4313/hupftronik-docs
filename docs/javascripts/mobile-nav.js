function expandMobileNav() {
  if (window.innerWidth <= 1220) {
    document.querySelectorAll('.md-nav__toggle').forEach(function(t) {
      t.checked = true;
    });
  }
}

// document$ is Material's post-initialisation observable (always present in Material 9+)
if (typeof document$ !== 'undefined') {
  document$.subscribe(expandMobileNav);
}
// window.load fires after ALL deferred scripts including Material's init
window.addEventListener('load', expandMobileNav);
window.addEventListener('resize', expandMobileNav);
