#include <gtk/gtk.h>
#include <webkit2/webkit2.h>

GtkWidget *main_window, *web_view;

static void
create ()
{
	main_window = gtk_window_new (GTK_WINDOW_TOPLEVEL);
	gtk_window_set_default_size (GTK_WINDOW (main_window), 854, 480);
	gtk_window_set_title (GTK_WINDOW (main_window), "YouTube Player");

	g_signal_connect(main_window, "destroy", G_CALLBACK(gtk_main_quit), NULL);

	web_view = webkit_web_view_new ();
	gtk_container_add (GTK_CONTAINER (main_window), web_view);

	WebKitSettings *settings = webkit_web_view_get_settings (WEBKIT_WEB_VIEW (web_view));
	g_object_set (G_OBJECT (settings), "enable-fullscreen", TRUE,
		      "enable-developer-extras", TRUE,
		      "enable-plugins", FALSE, NULL);

	gtk_widget_show_all (main_window);
}

static char *
read_html ()
{
	GFile *file;
	GFileInputStream *fstrm;
	GDataInputStream *dstrm;
	char *data = NULL;
	GError *err = NULL;

	file = g_file_new_for_path ("./yt-embed.html");
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

	/* TODO: template handling */

bail:
	g_object_unref (dstrm);
	g_object_unref (fstrm);
	g_object_unref (file);

	return data;
}

static gboolean
load (gpointer pointer)
{
	char *html = read_html();
	if (html) {
		webkit_web_view_load_html (WEBKIT_WEB_VIEW (web_view), html, "file:///");
		g_free (html);
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

