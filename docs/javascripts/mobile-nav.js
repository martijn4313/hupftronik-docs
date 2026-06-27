function expandMobileNav() {
  if (window.innerWidth <= 1220) {
    document.querySelectorAll('.md-nav__toggle').forEach(function(t) {
      t.checked = true;
    });
  }
}
document.addEventListener('DOMContentLoaded', expandMobileNav);
window.addEventListener('resize', expandMobileNav);
