#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

#include <string.h>

GtkWidget *main_window, *web_view;

static void
request_cb (WebKitURISchemeRequest *request, gpointer data)
{
	const gchar *path = webkit_uri_scheme_request_get_path (request);
	GFile *file;

	if (!path || path[0] == '\0') {
		file = g_file_new_for_uri ("resource:///org/wkgtk/uri-scheme/uri-scheme.html");
	} else {
		gchar *dir = g_get_current_dir ();
		gchar *fn = g_build_filename (dir, path, NULL);
		file = g_file_new_for_path (fn);
		g_free (dir);
		g_free (fn);
	}

	GError *error = NULL;
	GFileInputStream *strm = g_file_read (file, NULL, &error);
	if (error) {
		webkit_uri_scheme_request_finish_error (request, error);
		return;
	}

	webkit_uri_scheme_request_finish (request, G_INPUT_STREAM (strm), -1, "text/html");
	g_object_unref (strm);
	g_object_unref (file);
}

static void
register_uri ()
{
	WebKitWebContext *context = webkit_web_context_get_default ();
	WebKitSecurityManager *security = webkit_web_context_get_security_manager (context);

	webkit_web_context_register_uri_scheme (context, "sneaky", request_cb, NULL, NULL);
	webkit_security_manager_register_uri_scheme_as_cors_enabled (security, "sneaky");
}

static void
create ()
{
	main_window = gtk_window_new (GTK_WINDOW_TOPLEVEL);
	gtk_window_set_default_size (GTK_WINDOW (main_window), 854, 480);
	gtk_window_set_title (GTK_WINDOW (main_window), "URI Scheme");

	g_signal_connect(main_window, "destroy", G_CALLBACK (gtk_main_quit), NULL);

	web_view = webkit_web_view_new ();
	gtk_container_add (GTK_CONTAINER (main_window), web_view);

	WebKitSettings *settings = webkit_web_view_get_settings (WEBKIT_WEB_VIEW (web_view));
	g_object_set (G_OBJECT (settings), "enable-fullscreen", TRUE,
		      "enable-developer-extras", TRUE,
		      "enable-plugins", FALSE, NULL);

	gtk_widget_show_all (main_window);
}

static gboolean
load (gpointer pointer)
{
	webkit_web_view_load_uri (WEBKIT_WEB_VIEW (web_view), "sneaky:");

	return FALSE;
}

int
main(int argc, char **argv)
{
	gtk_init (&argc, &argv);

	create ();
	register_uri ();

	g_idle_add (load, NULL);

	gtk_main ();

	return 0;
}

