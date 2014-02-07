#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

#include <string.h>

static GtkWidget *main_window, *web_view;
static gboolean launched;

static gboolean
crashed (WebKitWebView *view, gpointer data)
{
	g_printerr ("The web view has crashed!\n");
	launched = FALSE;
	webkit_web_view_reload_bypass_cache (view);

	return TRUE; /* don't propagate event */
}

static void
js_cb (GObject *src, GAsyncResult *res, gpointer data)
{
	WebKitJavascriptResult *jsres;
	GError *err = NULL;

	jsres = webkit_web_view_run_javascript_finish (WEBKIT_WEB_VIEW (src), res, &err);
	if (!jsres) {
		g_printerr ("Error running javascript: %s\n", err->message);
		g_error_free (err);
		return;
	}
	webkit_javascript_result_unref (jsres);
}

static char *
read_json ()
{
	GFile *file;
	GFileInputStream *fstrm;
	GDataInputStream *dstrm;
	gchar *data = NULL;
	GError *err = NULL;

	file = g_file_new_for_uri ("resource:///org/wkgtk/khanacademy/khanacademy.json");
	fstrm = g_file_read (file, NULL, &err);
	if (!fstrm) {
		g_printerr ("Failed opening file: %s\n", err->message);
		g_error_free (err);
		goto bail;
	}
	dstrm = g_data_input_stream_new (G_INPUT_STREAM (fstrm));
	data = g_data_input_stream_read_upto (dstrm, "\0", 1, NULL, NULL, &err);
	if (!data) {
		g_printerr ("Failed reading file: %s\n", err->message);
		g_error_free (err);
		goto bail;
	}
	if (!g_input_stream_close (G_INPUT_STREAM (fstrm), NULL, &err)) {
		g_printerr ("Failed closing file: %s\n", err->message);
		g_error_free (err);
		goto bail;
	}

bail:
	g_object_unref (dstrm);
	g_object_unref (fstrm);
	g_object_unref (file);

	return data;
}

static void
changed (WebKitWebView *view, WebKitLoadEvent event, gpointer data)
{
	g_print ("%d ", event);
	if (!launched && event == WEBKIT_LOAD_FINISHED) {
		launched = TRUE;

		gchar *json = read_json ();
		if (!json)
			return;

		gchar *script = g_strdup_printf ("window.init_online(%s);", json);
		g_free (json);

		webkit_web_view_run_javascript (view, script, NULL, js_cb, NULL);
		g_free (script);
	}
}

static gboolean
failed (WebKitWebView *view, WebKitLoadEvent event, gchar *uri, GError *err, gpointer data)
{
	g_printerr ("%s loading failed: %s\n", uri, err->message);

	return TRUE; /* don't propagate event */
}

static void
create ()
{
	main_window = gtk_window_new (GTK_WINDOW_TOPLEVEL);
	gtk_window_set_default_size (GTK_WINDOW (main_window), 1024, 780);
	gtk_window_set_title (GTK_WINDOW (main_window), "Khan Academy");

	g_signal_connect(main_window, "destroy", G_CALLBACK (gtk_main_quit), NULL);

	web_view = webkit_web_view_new ();
	gtk_container_add (GTK_CONTAINER (main_window), web_view);

	WebKitSettings *settings = webkit_web_view_get_settings (WEBKIT_WEB_VIEW (web_view));
	g_object_set (G_OBJECT (settings), "enable-fullscreen", TRUE,
		      "enable-developer-extras", TRUE,
		      "enable-plugins", FALSE, NULL);

	g_object_connect (G_OBJECT(web_view),
			  "signal::web-process-crashed", G_CALLBACK (crashed), NULL,
			  "signal::load-changed", G_CALLBACK (changed), NULL,
			  "signal::load-failed", G_CALLBACK (failed), NULL,
			  NULL);

	gtk_widget_show_all (main_window);
}

static gboolean
load (gpointer pointer)
{
	GError *err = NULL;
	gchar *dir = g_get_current_dir ();
	gchar *file = g_build_path (G_DIR_SEPARATOR_S, dir, "webapp", "index.html", NULL);
	g_free (dir);
	gchar *uri = g_filename_to_uri (file, NULL, &err);
	g_free (file);

	if (uri) {
		launched = FALSE;
		webkit_web_view_load_uri (WEBKIT_WEB_VIEW (web_view), uri);
		g_free (uri);
	} else {
		g_printerr ("Not valid URI: %s\n", err->message);
		g_error_free (err);
	}

	return FALSE;
}

int
main(int argc, char **argv)
{
	gtk_init (&argc, &argv);
	create ();
	g_idle_add (load, NULL);
	gtk_main ();

	return 0;
}

