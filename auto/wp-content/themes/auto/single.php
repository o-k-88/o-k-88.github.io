<?php get_header('private'); ?>
<?php the_post();?>

<div class="container">
    <h2>
        <?php the_title();?>
    </h2>

    <p>
        <?php the_content();?>
    </p>
</div>



<?php get_footer(); ?>