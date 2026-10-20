/**
 * Kerf's website: the phone menu, the live demo's links, the film's timeline
 * (its chapters and pause button), the proof's subtract switch, and sections
 * fading in as they scroll into view. The page is complete without this file: links keep working, the
 * film plays, every section shows.
 */
( function () {
	'use strict';

	var root = document.documentElement;
	root.classList.add( 'js' );

	var reduceMotion = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	/* ---------- The phone menu ---------- */

	var nav = document.querySelector( '[data-nav]' );
	var toggle = nav && nav.querySelector( '[data-nav-toggle]' );
	if ( nav && toggle ) {
		var setOpen = function ( open ) {
			nav.setAttribute( 'data-nav-open', open ? 'true' : 'false' );
			toggle.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		};
		setOpen( false );
		toggle.addEventListener( 'click', function () {
			setOpen( 'true' !== nav.getAttribute( 'data-nav-open' ) );
		} );
		// A link chosen in the open menu closes it.
		nav.querySelectorAll( '#nav-links a' ).forEach( function ( link ) {
			link.addEventListener( 'click', function () {
				setOpen( false );
			} );
		} );
		document.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key && 'true' === nav.getAttribute( 'data-nav-open' ) ) {
				setOpen( false );
				toggle.focus();
			}
		} );
	}

	/* ---------- The film ---------- */

	// The timeline under it: a chapter, or anywhere on the ruler, goes there
	// and plays; the gradient fills as it plays, the current chapter is bold.
	var film = document.querySelector( '[data-film]' );
	var filmToggle = document.querySelector( '[data-film-toggle]' );
	var track = document.querySelector( '[data-reel-track]' );
	if ( film && filmToggle && track ) {
		var clock = document.querySelector( '[data-reel-clock]' );
		var chapterName = document.querySelector( '[data-reel-chapter]' );
		var chapters = Array.prototype.slice.call( track.querySelectorAll( '.reel-chapters li' ) );
		var starts = chapters.map( function ( li ) {
			return parseFloat( li.querySelector( 'button' ).getAttribute( 'data-t' ) );
		} );
		var userPaused = false;
		var frame = 0;

		var duration = function () {
			return isFinite( film.duration ) && film.duration > 0 ? film.duration : 36;
		};
		var format = function ( seconds ) {
			var s = Math.max( 0, Math.floor( seconds ) );
			return Math.floor( s / 60 ) + ':' + ( s % 60 < 10 ? '0' : '' ) + ( s % 60 );
		};
		var draw = function () {
			var t = film.currentTime || 0;
			track.style.setProperty( '--p', Math.min( 1, t / duration() ).toFixed( 4 ) );
			clock.textContent = format( t );
			var active = 0;
			for ( var i = 0; i < starts.length; i++ ) {
				if ( t + 0.05 >= starts[ i ] ) {
					active = i;
				}
			}
			chapters.forEach( function ( li, n ) {
				li.classList.toggle( 'is-active', n === active );
			} );
			chapterName.textContent = chapters[ active ].textContent.trim();
		};
		var loop = function () {
			draw();
			if ( ! film.paused ) {
				frame = window.requestAnimationFrame( loop );
			}
		};
		var showState = function () {
			var paused = film.paused;
			filmToggle.setAttribute( 'aria-pressed', paused ? 'true' : 'false' );
			filmToggle.setAttribute( 'aria-label', paused ? 'Play the film' : 'Pause the film' );
		};
		var play = function () {
			var attempt = film.play();
			if ( attempt && attempt.catch ) {
				// Autoplay refused, or the file missing: the poster and the play button.
				attempt.catch( showState );
			}
		};

		// Someone who asked for less motion gets the poster and the play button.
		if ( reduceMotion ) {
			film.removeAttribute( 'autoplay' );
			film.pause();
			userPaused = true;
		}
		film.addEventListener( 'play', function () {
			showState();
			window.cancelAnimationFrame( frame );
			frame = window.requestAnimationFrame( loop );
		} );
		film.addEventListener( 'pause', showState );
		film.addEventListener( 'seeked', draw );
		film.addEventListener( 'loadedmetadata', function () {
			track.style.setProperty( '--dur', duration().toFixed( 2 ) );
			draw();
		} );
		if ( film.readyState >= 1 ) {
			track.style.setProperty( '--dur', duration().toFixed( 2 ) );
		}

		filmToggle.addEventListener( 'click', function () {
			if ( film.paused ) {
				userPaused = false;
				play();
			} else {
				userPaused = true;
				film.pause();
			}
		} );

		track.addEventListener( 'click', function ( event ) {
			var button = event.target.closest( 'button[data-t]' );
			var t;
			if ( button ) {
				t = parseFloat( button.getAttribute( 'data-t' ) );
			} else {
				var box = track.getBoundingClientRect();
				t = ( event.clientX - box.left ) / box.width * duration();
			}
			film.currentTime = Math.max( 0, Math.min( duration() - 0.1, t ) );
			userPaused = false;
			play();
			draw();
		} );

		// It plays while it is on screen, unless someone paused it.
		if ( 'IntersectionObserver' in window ) {
			new IntersectionObserver( function ( entries ) {
				entries.forEach( function ( entry ) {
					if ( entry.isIntersecting ) {
						if ( ! userPaused ) {
							play();
						}
					} else if ( ! film.paused ) {
						film.pause();
					}
				} );
			}, { threshold: 0.35 } ).observe( film );
		}
		showState();
		draw();
	}

	/* ---------- The proof: Kerf's page, or a lookalike ---------- */

	// A lookalike is the same page moved 3 pixels, as a page rebuilt by hand
	// is "close": subtracted, every edge lights up. Kerf's leaves black.
	var stage = document.querySelector( '[data-proof]' );
	var proofToggle = document.querySelector( '[data-proof-toggle]' );
	var proofNote = document.querySelector( '[data-proof-note]' );
	var proofMiddle = document.querySelector( '[data-proof-middle]' );
	if ( stage && proofToggle && proofNote && proofMiddle ) {
		var kerfNote = proofNote.textContent;
		var kerfMiddle = proofMiddle.textContent;
		proofToggle.addEventListener( 'click', function () {
			var lookalike = ! stage.hasAttribute( 'data-lookalike' );
			if ( lookalike ) {
				stage.setAttribute( 'data-lookalike', '' );
				proofToggle.textContent = 'Back to Kerf’s page';
				proofMiddle.textContent = 'A lookalike, 3 pixels off';
				proofNote.textContent = 'This is a lookalike: the same page, moved just 3 pixels, closer than a rebuild by hand usually gets. Every edge that moved lights up. Kerf’s page leaves nothing.';
			} else {
				stage.removeAttribute( 'data-lookalike' );
				proofToggle.textContent = 'Compare a lookalike instead';
				proofMiddle.textContent = kerfMiddle;
				proofNote.textContent = kerfNote;
			}
		} );
	}

	/* ---------- Sections fade in as they arrive ---------- */

	var reveals = document.querySelectorAll( '[data-reveal]' );
	if ( reduceMotion || ! ( 'IntersectionObserver' in window ) ) {
		reveals.forEach( function ( el ) {
			el.classList.add( 'is-in' );
		} );
	} else {
		var watch = new IntersectionObserver( function ( entries ) {
			entries.forEach( function ( entry ) {
				if ( entry.isIntersecting ) {
					entry.target.classList.add( 'is-in' );
					watch.unobserve( entry.target );
				}
			} );
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 } );
		reveals.forEach( function ( el ) {
			watch.observe( el );
		} );
	}
}() );
