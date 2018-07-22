<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package Penscratch 2
 */
?>

	</div><!-- #content -->

	<footer id="colophon" class="site-footer" role="contentinfo">
		<?php if ( is_active_sidebar( 'sidebar-2' ) || is_active_sidebar( 'sidebar-3' ) || is_active_sidebar( 'sidebar-4' ) ) : ?>
			<div class="footer-widgets clear">
				<?php if ( is_active_sidebar( 'sidebar-2' ) ): ?>
					<div class="widget-area">
						<?php dynamic_sidebar( 'sidebar-2' ); ?>
					</div><!-- .widget-area -->
				<?php endif; //is_active_sidebar ?>

				<?php if ( is_active_sidebar( 'sidebar-3' ) ): ?>
					<div class="widget-area">
						<?php dynamic_sidebar( 'sidebar-3' ); ?>
					</div><!-- .widget-area -->
				<?php endif; //is_active_sidebar ?>

				<?php if ( is_active_sidebar( 'sidebar-4' ) ): ?>
					<div class="widget-area">
						<?php dynamic_sidebar( 'sidebar-4' ); ?>
					</div><!-- .widget-area -->
				<?php endif; //is_active_sidebar ?>
			</div><!-- .sidebar-widgets -->
		<?php endif; ?>
		<div class="site-info-wrapper clear">
			<?php penscratch_2_social_menu(); ?>
			<div class="site-info">
			Built by ROUNDBEARGAMES
			<br><a href="https://steemit.com/@roundbeargames" target="_blank">support us on steemit</a>
			</div><!-- .site-info -->
		</div><!-- .site-info-wrapper -->
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
