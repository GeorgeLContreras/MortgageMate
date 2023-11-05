// Get all input elements of type "number"
const numberInputs = document.querySelectorAll('input[type="number"]');

// Add an event listener to each input to change the background color when typing
numberInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.style.backgroundColor = "#007acc"; // Change to blue when typing
  });

  input.addEventListener("blur", () => {
    input.style.backgroundColor = "#fff"; // Reset to the initial color when losing focus
  });
});
