function toggleDropdown(id) {
  const dropdown = document.getElementById(id)
  const allDropdowns = document.querySelectorAll(".dropdown-content")
  const allToggles = document.querySelectorAll(".dropdown-toggle")

  allDropdowns.forEach((item, index) => {
    if (item.id === id) {
      item.classList.toggle("active")
      allToggles[index].classList.toggle("active")
    } else {
      item.classList.remove("active")
      allToggles[index].classList.remove("active")
    }
  })
}
