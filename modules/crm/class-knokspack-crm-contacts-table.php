<?php
if (!defined('ABSPATH')) exit;

class Knokspack_CRM_Contacts_Table extends WP_List_Table {
    private $table_data;

    public function __construct() {
        parent::__construct(array(
            'singular' => 'contact',
            'plural' => 'contacts',
            'ajax' => false
        ));
    }

    public function prepare_items() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'knokspack_crm_contacts';
        $per_page = 20;
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();

        $this->_column_headers = array($columns, $hidden, $sortable);
        
        $current_page = $this->get_pagenum();
        $offset = ($current_page - 1) * $per_page;

        $search = isset($_REQUEST['s']) ? sanitize_text_field($_REQUEST['s']) : '';
        
        $where = '';
        if (!empty($search)) {
            $where = $wpdb->prepare(
                " WHERE name LIKE %s OR email LIKE %s OR company LIKE %s",
                '%' . $search . '%',
                '%' . $search . '%',
                '%' . $search . '%'
            );
        }

        $orderby = isset($_REQUEST['orderby']) ? sanitize_text_field($_REQUEST['orderby']) : 'created_at';
        $order = isset($_REQUEST['order']) ? sanitize_text_field($_REQUEST['order']) : 'DESC';
        
        $total_items = $wpdb->get_var("SELECT COUNT(*) FROM $table_name $where");
        
        $this->table_data = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name $where ORDER BY $orderby $order LIMIT %d OFFSET %d",
                $per_page,
                $offset
            ),
            ARRAY_A
        );

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
            'total_pages' => ceil($total_items / $per_page)
        ));
    }

    public function get_columns() {
        return array(
            'cb' => '<input type="checkbox" />',
            'name' => __('Name', 'knokspack'),
            'email' => __('Email', 'knokspack'),
            'company' => __('Company', 'knokspack'),
            'phone' => __('Phone', 'knokspack'),
            'type' => __('Type', 'knokspack'),
            'status' => __('Status', 'knokspack'),
            'created_at' => __('Created', 'knokspack'),
            'last_contact' => __('Last Contact', 'knokspack')
        );
    }

    public function get_sortable_columns() {
        return array(
            'name' => array('name', false),
            'email' => array('email', false),
            'company' => array('company', false),
            'type' => array('type', false),
            'status' => array('status', false),
            'created_at' => array('created_at', true),
            'last_contact' => array('last_contact', false)
        );
    }

    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'created_at':
            case 'last_contact':
                return date('Y-m-d H:i', strtotime($item[$column_name]));
            default:
                return isset($item[$column_name]) ? esc_html($item[$column_name]) : '';
        }
    }

    public function column_name($item) {
        $actions = array(
            'edit' => sprintf(
                '<a href="?page=knokspack-crm&action=edit&id=%s">%s</a>',
                $item['id'],
                __('Edit', 'knokspack')
            ),
            'delete' => sprintf(
                '<a href="?page=knokspack-crm&action=delete&id=%s&_wpnonce=%s" onclick="return confirm(\'%s\');">%s</a>',
                $item['id'],
                wp_create_nonce('delete_contact_' . $item['id']),
                __('Are you sure you want to delete this contact?', 'knokspack'),
                __('Delete', 'knokspack')
            )
        );

        return sprintf(
            '<strong>%1$s</strong> %2$s',
            esc_html($item['name']),
            $this->row_actions($actions)
        );
    }

    public function column_cb($item) {
        return sprintf(
            '<input type="checkbox" name="contacts[]" value="%s" />',
            $item['id']
        );
    }

    public function get_bulk_actions() {
        return array(
            'delete' => __('Delete', 'knokspack'),
            'mark_active' => __('Mark as Active', 'knokspack'),
            'mark_inactive' => __('Mark as Inactive', 'knokspack')
        );
    }

    protected function process_bulk_action() {
        global $wpdb;

        if ('delete' === $this->current_action()) {
            $contacts = isset($_REQUEST['contacts']) ? array_map('intval', $_REQUEST['contacts']) : array();
            
            if (!empty($contacts)) {
                check_admin_referer('bulk-' . $this->_args['plural']);
                
                $table_name = $wpdb->prefix . 'knokspack_crm_contacts';
                $ids = implode(',', $contacts);
                
                $wpdb->query("DELETE FROM $table_name WHERE id IN ($ids)");
                
                wp_redirect(add_query_arg());
                exit;
            }
        }
    }
}
