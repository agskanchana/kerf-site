/**
 * Kerf's website: the phone menu, the live demo's links, the film's pause
 * button, the proof's subtract switch, and sections fading in as they scroll
 * into view. The page is complete without this file: links keep working, the
 * film plays, every section shows.
 */
( function () {
	'use strict';

	var root = document.documentElement;
	root.classList.add( 'js' );

	var reduceMotion = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	/* ---------- The live demo ---------- */

	// WordPress Playground runs a private WordPress in the visitor's browser and
	// sets it up from a blueprint. The same blueprint as demo/blueprint.json
	// (the links' own address, used without this script), with Kerf's zip
	// taken from wherever this page is served — kerf.site, or a preview copy —
	// and passed in the address itself, so no second file has to be fetched.
	var samplePosts = [
		"<?php require '/wordpress/wp-load.php';",
		"$posts = array(",
		"array( 'A fresh start for our website', 'Our website now runs on WordPress. It looks exactly as it did, and every word and picture can be changed from the dashboard.' ),",
		"array( 'How we work', 'Every project starts with a conversation: what you make, who it is for, and what you want people to do when they find you.' ),",
		"array( 'Notes from the studio', 'A few things we learned this season about photographs, short headlines and pages that load quickly on a phone.' )",
		");",
		"foreach ( $posts as $i => $p ) {",
		"wp_insert_post( array( 'post_title' => $p[0], 'post_content' => '<!-- wp:paragraph --><p>' . $p[1] . '</p><!-- /wp:paragraph -->', 'post_status' => 'publish', 'post_date' => gmdate( 'Y-m-d H:i:s', time() - ( $i + 1 ) * 259200 ) ) );",
		"}",
		"global $wp_rewrite; $wp_rewrite->set_permalink_structure( '/%postname%/' ); $wp_rewrite->flush_rules( true );"
	].join( ' ' );

	function demoUrl() {
		var zip = new URL( 'demo/kerf-demo.zip', document.baseURI ).href;
		var blueprint = {
			landingPage: '/wp-admin/admin.php?page=kerf-import',
			preferredVersions: { php: '8.3', wp: 'latest' },
			features: { networking: true },
			login: true,
			steps: [
				{ step: 'setSiteOptions', options: { blogname: 'My Kerf demo', blogdescription: '' } },
				{ step: 'installTheme', themeData: { resource: 'url', url: zip }, options: { activate: true } },
				{ step: 'runPHP', code: samplePosts }
			]
		};
		return 'https://playground.wordpress.net/#' + encodeURIComponent( JSON.stringify( blueprint ) );
	}

	// Playground can only fetch the zip over https; a page opened from disk
	// keeps the links' own address (kerf.site's blueprint).
	if ( 'https:' === location.protocol ) {
		var url = demoUrl();
		document.querySelectorAll( '[data-kerf-demo]' ).forEach( function ( link ) {
			link.href = url;
		} );
	}

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

	var film = document.querySelector( '[data-film]' );
	var filmToggle = document.querySelector( '[data-film-toggle]' );
	if ( film && filmToggle ) {
		var showState = function () {
			var paused = film.paused;
			filmToggle.setAttribute( 'aria-pressed', paused ? 'true' : 'false' );
			filmToggle.setAttribute( 'aria-label', paused ? 'Play the film' : 'Pause the film' );
		};
		// Someone who asked for less motion gets the poster and the play button.
		if ( reduceMotion ) {
			film.removeAttribute( 'autoplay' );
			film.pause();
		}
		film.addEventListener( 'play', showState );
		film.addEventListener( 'pause', showState );
		filmToggle.addEventListener( 'click', function () {
			if ( film.paused ) {
				film.play();
			} else {
				film.pause();
			}
		} );
		showState();
	}

	/* ---------- The proof: subtract on and off ---------- */

	var stage = document.querySelector( '[data-proof]' );
	var proofToggle = document.querySelector( '[data-proof-toggle]' );
	if ( stage && proofToggle ) {
		proofToggle.addEventListener( 'click', function () {
			var on = 'true' !== proofToggle.getAttribute( 'aria-pressed' );
			proofToggle.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
			if ( on ) {
				stage.removeAttribute( 'data-subtract' );
			} else {
				stage.setAttribute( 'data-subtract', 'off' );
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
