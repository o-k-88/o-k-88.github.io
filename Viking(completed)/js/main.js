$(function () {

    $('[data-fancybox]').fancybox({
        youtube: {
            controls: 1,
            showinfo: 1
        }
    });

    $('.menu__btn').on('click', function () {
        $('.menu__list').toggleClass('menu__list--active')
    });

    $('.heroes__silder-img').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.heroes__silder-text',
        prevArrow: '<button class="slick-btn slick-prev"><img src="images/prev.png" alt=""></button>',
        nextArrow: '<button class="slick-btn slick-next"><img src="images/next.png" alt=""></button>',
        responsive: [
            {
                breakpoint: 769,
                settings: {
                    arrows: false
                }
            }
        ]
    });
    $('.heroes__silder-text').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.heroes__silder-img',
        fade: true,
        arrows: false
    });
});

