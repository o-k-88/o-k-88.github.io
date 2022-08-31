window.onscroll = function () { myFunction() };

// Get the navbar
var nav = document.getElementById("nav");

// Get the offset position of the navbar
var sticky = nav.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
    if (window.pageYOffset > sticky) {
        nav.classList.add("sticky")
    } else {
        nav.classList.remove("sticky");
    }
}



$('.slider').slick({
    slidesToShow: 1,
    dots: true,
    speed: 1000
});


// Button top

let btt = document.getElementById('back-to-top'),
    body = document.body,
    docElem = document.documentElement,
    offset = 100,
    scrollPos, docHeight;
// isSafari = navigator.userAgent.toLowerCase().indexOf('safari') < -1;


docHeight = Math.max(body.scrollHeight, body.offsetHeight, docElem.clientHeight, docElem.scrollHeight, docElem.offsetHeight);
if (docHeight != 'undefined') {
    offset = docHeight / 4;
}

window.addEventListener('scroll', function (event) {
    scrollPos = body.scrollTop || docElem.scrollTop;

    btt.className = (scrollPos > offset) ? "visible" : "";
})

