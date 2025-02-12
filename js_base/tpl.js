$(document).ready(function() {
	navHoverInit({ delay: { show: 250, hide: 350 } });
	initBackToTop();
	initMastheadCarousel();
});

var initMastheadCarousel = function () {
	if (!$.fn.carousel) { return false; }

	currItem = $('.masthead-carousel .item.active');

	$('.masthead-carousel').carousel({ interval: false }).on('slide.bs.carousel', function (e) {
		var next = $(e.relatedTarget),
			nextH = next.height(),
			active = $(this).find('.active.item');

		if (currItem.height () > nextH) {
			next.height(active.height());
		}

		active.parent().animate({ height: nextH }, 500, function () {
			next.height(nextH);
			currItem = $(e.relatedTarget);
		});
	});

	$(window).resize (function () {
		var item = $('.active.item'),
			curH = item.height();

		item.parent().height(curH);
	});
}


function initLightbox() {
	if ($.fn.magnificPopup) {
		$('.ui-lightbox').magnificPopup({
			type: 'image',
			closeOnContentClick: false,
			closeBtnInside: true,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom',
			image: {
				verticalFit: true,
				// TODO: lang
				tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
			}
		});

		$('.ui-lightbox-video, .ui-lightbox-iframe').magnificPopup({
			disableOn: 700,
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: false
		});

		$('.ui-lightbox-gallery').magnificPopup({
			delegate: 'a',
			type: 'image',
			// TODO: lang
			tLoading: 'Loading image #%curr%...',
			mainClass: 'mfp-img-mobile',
			gallery: {
				enabled: true,
				navigateByImgClick: true,
				preload: [0,1]
			},
			image: {
				// TODO: lang
				tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
				titleSrc: function(item) {
				return item.el.attr('title')
				}
			}
		});
	}
}

function initBackToTop() {
	var backToTop	= $('<a>', { id: 'back-to-top', href: '#top' }),
		icon		= $('<i>', { 'class': 'fa fa-chevron-up' });

	backToTop.appendTo('body');
	icon.appendTo(backToTop);
	backToTop.hide();

	$(window).scroll (function () {
		if ($(this).scrollTop() > 150) {
			backToTop.fadeIn();
		} else {
			backToTop.fadeOut();
		}
	});

	backToTop.click (function (e) {
		e.preventDefault();
		$('body, html').animate({
			scrollTop: 0
			}, 600
		);
	});
}
function navHoverInit(config) {
	$('[data-hover="dropdown"]').each(function () {
		var $this		= $(this),
			defaults	= { delay: { show: 1000, hide: 1000 } },
			$parent		= $this.parent (),
			settings	= $.extend (defaults, config),
			timeout;

		if (!('ontouchstart' in document.documentElement)) {
			$parent.find ('.dropdown-toggle').click (function (e) {
				if (!isLayoutCollapsed()) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
		}

		$parent.mouseenter(function () {
			if (isLayoutCollapsed ()) { return false; }

			timeout = setTimeout (function () {
					$parent.addClass('open');
					$parent.trigger('show.bs.dropdown');
				},
				settings.delay.show
			);
		});

		$parent.mouseleave(function () {
			if (isLayoutCollapsed()) { return false; }

			clearTimeout(timeout);

			timeout = setTimeout (function () {
					$parent.removeClass ('open keep-open');
					$parent.trigger ('hide.bs.dropdown');
				},
				settings.delay.hide
			);
		});
	});
}
function isLayoutCollapsed() {
	return $('.navbar-toggle').css('display') == 'block';
}