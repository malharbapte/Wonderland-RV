/* Sends the visitor to the thank-you page once an enquiry form is submitted.
   Nothing is posted anywhere yet (the forms are not wired to a service), so
   this checks the form is valid and then moves on. */
document.addEventListener("submit", function (e) {
  var f = e.target;
  if (!f.matches || !f.matches(".enquiry-form, .home-form")) return;
  e.preventDefault();
  if (!f.checkValidity()) { f.reportValidity(); return; }
  var t = f.querySelector('input[name="enquiry-type"]:checked');
  try { sessionStorage.setItem("wlThanks", JSON.stringify({ route: "enquiry", type: t ? t.value : "" })); } catch (err) {}
  location.href = "thank-you.html";
});
