document.getElementById("batButton").addEventListener("click", function() {
  let bat = document.createElement("div");
  bat.className = "bat";
  bat.style.left = event.clientX + "px";
  bat.style.top = event.clientY + "px";
  document.getElementById("batContainer").appendChild(bat);
  setTimeout(function() {
    bat.remove();
  }, 2000); // Remove the bat after 2 seconds (duration of the animation)
});
