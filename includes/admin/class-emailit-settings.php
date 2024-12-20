<?php
if (!defined('ABSPATH')) exit;

class Emailit_Settings {
    private $options;

    public function __construct() {
        add_action('admin_menu', array($this, 'add_plugin_page'));
        add_action('admin_init', array($this, 'page_init'));
    }

    public function add_plugin_page() {
        add_options_page(
            'Configuration Emailit', 
            'Emailit', 
            'manage_options', 
            'emailit-settings', 
            array($this, 'create_admin_page')
        );
    }

    public function create_admin_page() {
        $this->options = get_option('emailit_settings');
        ?>
        <div class="wrap">
            <h1>Configuration Emailit</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('emailit_options');
                do_settings_sections('emailit-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function page_init() {
        register_setting(
            'emailit_options',
            'emailit_settings',
            array($this, 'sanitize')
        );

        add_settings_section(
            'emailit_api_section',
            'Paramètres API',
            array($this, 'section_info'),
            'emailit-settings'
        );

        add_settings_field(
            'api_key',
            'Clé API',
            array($this, 'api_key_callback'),
            'emailit-settings',
            'emailit_api_section'
        );
    }

    public function sanitize($input) {
        $new_input = array();
        if(isset($input['api_key']))
            $new_input['api_key'] = sanitize_text_field($input['api_key']);
        return $new_input;
    }

    public function section_info() {
        echo 'Entrez vos paramètres API Emailit ci-dessous :';
    }

    public function api_key_callback() {
        printf(
            '<input type="text" id="api_key" name="emailit_settings[api_key]" value="%s" class="regular-text" />',
            isset($this->options['api_key']) ? esc_attr($this->options['api_key']) : ''
        );
    }
} 