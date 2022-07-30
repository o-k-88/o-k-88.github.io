<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'auto_bd' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'UU2.?< A+|N1hEr?ZWMS5xI.8Bb]l6aTMQJhkdY4cWu*F9/MM7+/cK#/^vm#kLD>' );
define( 'SECURE_AUTH_KEY',  'Rys|wba^Jmlb/aYp/$w;d{!+|!A+###onVn4cM;09x>j89)QBH@Np9vvusprh8F ' );
define( 'LOGGED_IN_KEY',    'mGSVP+>yL<Pe2o>|tD pVZ?&8G9DZ.%y2i:lI`xt`;aG%9PJK.)QARzw1[4wrR?]' );
define( 'NONCE_KEY',        '&a~1=|=|!%+LomuWn3R?]+J(J<NEZh &].0]tPY&hG7syRPFS?;TxGRU;_*YUrOq' );
define( 'AUTH_SALT',        'B5$^ Z~d>/K|y/JO|)$29b)*>[i(ID}8bFwmMOq2z]8x:PZdkOT|#djayx[K!rLr' );
define( 'SECURE_AUTH_SALT', 'yQi%a[RD,Qa:_%vPXtwG+qIYUq+T!^zt/zF*;!e?<Smbl1] *5a|wXg(HJntT)(]' );
define( 'LOGGED_IN_SALT',   'Pr,!>F!tIK-gIW7u2KW,M4$TV(xN!(a@{2g;m4#S*>RHn{K}/PPl.><3A8Cte7;+' );
define( 'NONCE_SALT',       'a@dmK~WCQ^uF~ Q$C<rJjI$;oJ;X)Sg6KX*8sVm?hF8m(n:-g+t?DTL+E|?B>.f/' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
